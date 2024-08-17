;(function () {
  var $,
    ele,
    container,
    canvas,
    num,
    prizes,
    btn,
    deg = 0,
    fnGetPrize,
    fnGotBack,
    optsPrize

  var cssPrefix,
    eventPrefix,
    vendors = {
      '': '',
      Webkit: 'webkit',
      Moz: '',
      O: 'o',
      ms: 'ms'
    },
    testEle = document.createElement('p'),
    cssSupport = {}

  Object.keys(vendors).some(function (vendor) {
    if (
      testEle.style[vendor + (vendor ? 'T' : 't') + 'ransitionProperty'] !==
      undefined
    ) {
      cssPrefix = vendor ? '-' + vendor.toLowerCase() + '-' : ''
      eventPrefix = vendors[vendor]
      return true
    }
  })

  function normalizeEvent (name) {
    return eventPrefix ? eventPrefix + name : name.toLowerCase()
  }

  function normalizeCss (name) {
    name = name.toLowerCase()
    return cssPrefix ? cssPrefix + name : name
  }

  cssSupport = {
    cssPrefix: cssPrefix,
    transform: normalizeCss('Transform'),
    transitionEnd: normalizeEvent('TransitionEnd')
  }

  var transform = cssSupport.transform
  var transitionEnd = cssSupport.transitionEnd

  function init (opts) {
    fnGetPrize = opts.getPrize
    fnGotBack = opts.gotBack
    opts.config(function (data) {
      prizes = opts.prizes = data
      num = prizes.length
      draw(opts)
    })
    events()
  }

  $ = function (id) {
    return document.getElementById(id)
  }

  function draw (opts) {
    opts = opts || {}
    if (!opts.id || num >>> 0 === 0) return

    var id = opts.id,
      rotateDeg = 360 / num / 2 + 90,
      ctx,
      prizeItems = document.createElement('ul'),
      turnNum = 1 / num,
      html = []

    ele = $(id)
    canvas = ele.querySelector('.hc-luckywheel-canvas')
    container = ele.querySelector('.hc-luckywheel-container')
    btn = ele.querySelector('.hc-luckywheel-btn')

    if (!canvas.getContext) {
      showMsg('Browser không hỗ trợ canvas.')
      return
    }

    ctx = canvas.getContext('2d')

    for (var i = 0; i < num; i++) {
      ctx.save()
      ctx.beginPath()
      ctx.translate(250, 250)
      ctx.moveTo(0, 0)
      ctx.rotate((((360 / num) * i - rotateDeg) * Math.PI) / 180)
      ctx.arc(0, 0, 250, 0, (2 * Math.PI) / num, false)
      ctx.fillStyle = i % 2 === 0 ? '#ffb820' : '#ffcb3f'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#e4370e'
      ctx.stroke()
      ctx.restore()

      var prizeList = opts.prizes
      html.push('<li class="hc-luckywheel-item"><span style="')
      html.push(transform + ': rotate(' + i * turnNum + 'turn)">')
      if (opts.mode === 'both') {
        html.push("<p id='curve'>" + prizeList[i].text + '</p>')
        html.push('<img src="' + prizeList[i].img + '" />')
      } else if (prizeList[i].img) {
        html.push('<img src="' + prizeList[i].img + '" />')
      } else {
        html.push('<p id="curve">' + prizeList[i].text + '</p>')
      }
      html.push('</span></li>')
    }

    prizeItems.className = 'hc-luckywheel-list'
    container.appendChild(prizeItems)
    prizeItems.innerHTML = html.join('')
  }

  function showMsg (msg) {
    alert(msg)
  }

  function runRotate (deg) {
    container.style[transform] = 'rotate(' + deg + 'deg)'
  }

  function events () {
    bind(btn, 'click', function () {
      var urlParams = new URLSearchParams(window.location.search)
      var oxygen = parseInt(urlParams.get('oxygen'), 10) || 0

      if (oxygen < 100) {
        Swal.fire('Not enough oxygen to spin!')
        return
      }

      oxygen -= 100
      urlParams.set('oxygen', oxygen)
      window.history.replaceState({}, '', `${location.pathname}?${urlParams}`)

      addClass(btn, 'disabled')

      fnGetPrize(function (data) {
        if (data[0] == null || data[1] == null) {
          return
        }

        optsPrize = {
          prizeId: data[0],
          chances: data[1]
        }
        deg = deg + (360 - (deg % 360)) + (360 * 10 - data[0] * (360 / num))
        runRotate(deg)
      })

      bind(container, transitionEnd, function () {
        if (optsPrize.chances == null) {
          return fnGotBack(null)
        } else {
          removeClass(btn, 'disabled')
          return fnGotBack(prizes[optsPrize.prizeId])
        }
      })
    })
  }

  function bind (ele, event, fn) {
    if (typeof addEventListener === 'function') {
      ele.addEventListener(event, fn, false)
    } else if (ele.attachEvent) {
      ele.attachEvent('on' + event, fn)
    }
  }

  function hasClass (ele, cls) {
    return ele.classList
      ? ele.classList.contains(cls)
      : new RegExp('(\\s|^)' + cls + '(\\s|$)').test(ele.className)
  }

  function addClass (ele, cls) {
    if (ele.classList) {
      ele.classList.add(cls)
    } else if (!hasClass(ele, cls)) {
      ele.className += ' ' + cls
    }
  }

  function removeClass (ele, cls) {
    if (ele.classList) {
      ele.classList.remove(cls)
    } else {
      ele.className = ele.className.replace(
        new RegExp('(\\s|^)' + cls + '(\\s|$)'),
        ' '
      )
    }
  }

  var hcLuckywheel = {
    init: function (opts) {
      return init(opts)
    }
  }

  window.hcLuckywheel === undefined && (window.hcLuckywheel = hcLuckywheel)

  if (typeof define === 'function' && define.amd) {
    define('HellCat-Luckywheel', [], function () {
      return hcLuckywheel
    })
  }
})()

function checkPrize (result, fulldata) {
  var urlParams = new URLSearchParams(window.location.search)
  var plants = urlParams.get('plants').split(',')
  var pots = urlParams.get('pots').split(',')

  if (plants.includes(result)) {
    Swal.fire('Already own this item')
  } else if (pots.includes(result)) {
    Swal.fire('Already own this item')
  } else {
    window.flutter_inappwebview.callHandler('clam-lavender-plant', fulldata)
  }
}
