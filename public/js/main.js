document.querySelector('#add-post-panel-show').addEventListener('click',element=> {
  document.querySelector('#make-post-panel').classList.remove('hide')
  console.log('removing')
})

document.querySelector('#submitComment').addEventListener('click', element=> {
  fetch('comment', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      postID: document.querySelector("input[name='id']").value,
      commentBody: document.querySelector("input[name='comment-body']").value,

    })
  })
  .then(response => {
    if (response.ok) {
      return response.json()

    }
  })
  .then(data => {

    console.log(data)
    window.location.replace(`/post/${document.querySelector("input[name='id']").value}`)

  })
})
