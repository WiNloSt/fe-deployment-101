;(function() {
  const APP_NODE_ID = 'app-container'
  const appNode = document.getElementById(APP_NODE_ID)
  let renderFunctionsMap

  function wrapPushStateFunction() {
    const wrap = function(type) {
      var orig = history[type]
      return function() {
        var rv = orig.apply(this, arguments)
        var e = new Event(type)
        e.arguments = arguments
        window.dispatchEvent(e)
        return rv
      }
    }

    history.pushState = wrap('pushState')
  }

  function registerNavEventListeners() {
    document.querySelector('nav li:nth-child(1)').addEventListener('click', e => {
      e.preventDefault()
      history.pushState({ page: 'home' }, 'Home', '//' + location.host)
    })
    document.querySelector('nav li:nth-child(2)').addEventListener('click', e => {
      e.preventDefault()
      history.pushState({ page: 'posts' }, 'Posts', '/posts')
    })
  }

  function handleRouteChange() {
    window.addEventListener('pushState', ({ arguments: [state, title] }) => {
      document.title = title
      const renderFunction = renderFunctionsMap[state.page]
      if (renderFunction) {
        clearPage()
        renderFunction()
      }
    })
  }

  function clearPage() {
    appNode.innerText = ''
  }

  async function renderPostsPage() {
    const loader = document.createElement('div')
    appNode.appendChild(loader)
    loader.innerText = 'Loading ...'
    const posts = await fetch(
      'http://slowwly.robertomurray.co.uk/delay/1500/url/https://jsonplaceholder.typicode.com/posts'
    ).then(res => res.json())

    loader.remove()
    appNode.appendChild(document.createElement('ul'))
    const createPost = post => {
      const postContainer = document.createElement('div')
      const header = document.createElement('h2')
      const body = document.createElement('p')

      header.innerText = post.title
      body.innerText = post.body
      postContainer.appendChild(header)
      postContainer.appendChild(body)

      return postContainer
    }

    posts.forEach(post => {
      const list = document.createElement('li')
      list.appendChild(createPost(post))

      document.querySelector(`#${APP_NODE_ID} > ul`).appendChild(list)
    })
  }

  function renderHomePage() {
    const header = document.createElement('h1')
    const body = document.createElement('p')
    header.innerText = 'Home'
    body.innerText = 'Welcome to our site'

    appNode.appendChild(header)
    appNode.appendChild(body)
  }

  renderFunctionsMap = {
    posts: renderPostsPage,
    home: renderHomePage
  }

  function bootstrap() {
    wrapPushStateFunction()
    registerNavEventListeners()
    handleRouteChange()
    renderHomePage()
  }

  bootstrap()
})()
