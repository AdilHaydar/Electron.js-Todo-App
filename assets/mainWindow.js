const electron = require('electron')

const { ipcRenderer } = electron

checkTodoCount() //İlk olarak uygulama başladığında kontrol ediyoruz bunu.

const todoValue = document.querySelector('#todoValue')

ipcRenderer.on('init', (err, todos) => {
    todos.forEach(todo => {
        drawRow(todo)
    })
})


todoValue.addEventListener('keypress', (e) => {
    if(e.keyCode == 13){
        if(e.target.value === ''){
            alert('Boş Veri Girilemez')
        }else{
            ipcRenderer.send('newTodo:save', {ref:"main",todoValue:e.target.value})
            e.target.value = ''
        }
        
    }
})

document.querySelector('#addBtn').addEventListener('click', () => {
    if(todoValue.value === ''){
        alert('Boş Veri Giriliemez')
    }
    else{
        ipcRenderer.send('newTodo:save', {ref:"main",todoValue:todoValue.value})
        // burada veri gönderme kısmında bir obje gönderiyoruz çünkü biz bu veriyi tek fonksiyona gönderiyoruz ve o fonksiyon addWindow değişkenine atanmış pencereyi kapatmaya çalışıyor, biz mainWindow'dan gönderdiğimiz zaman değeri addWindow olmadığı için hata alıyorduk ve bu hatanın önüne geçmek için bir obje gönderip obje içerisine veri ile birlikte birde ref anahtar kelimesi verdik ki bu anahtar kelime sayesinde hangi pencereden ekleme işlemi yapıldığını belirtmek için.
        todoValue.value = ''
    }
    
})

document.querySelector('#closeBtn').addEventListener('click', () => {
    if(confirm("Çıkmak İstiyor musunuz?")){
        ipcRenderer.send('todo:close')
    }
})

ipcRenderer.on('todo:addItem', (e, todo) => {
    drawRow(todo)
}) //backend veri gönderirklen send, backend'den veri alırken on kullanıyoruz.

function checkTodoCount(){
    const container = document.querySelector('.todo-container')
    const alertContainer = document.querySelector('.alert-container')
    const totalCountContainer = document.querySelector('.total-count-container')
    totalCountContainer.innerText = container.children.length
    if(container.children.length !== 0){
        alertContainer.style.display = 'none'
    }else {
        alertContainer.style.display = 'block'
    }
}

function drawRow(todo){
     // container
     const container = document.querySelector('.todo-container')

     // row
     const row = document.createElement('div')
     row.className = 'row'
 
     // col
     const col = document.createElement('div')
     col.className = 'p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center'
     col.style = 'background-color: #582E46 !important'
 
     // p
     const p = document.createElement('p')
     p.className = 'm-0 w-100'
     p.innerText = todo.text
 
     // sil Btn
 
     const deleteBtn = document.createElement('button')
     deleteBtn.className = 'btn btn-sm btn-outline-danger flex-shrink-1'
     deleteBtn.innerText = 'X'
     deleteBtn.setAttribute('data-id', todo.id)
 
     deleteBtn.addEventListener('click', (e) => {
         if(confirm("Bu Kaydı Silmek İstediğinizden Emin Misiniz ?")){
             e.target.parentNode.parentNode.remove()
             ipcRenderer.send("remove:todo", e.target.getAttribute('data-id'))
             checkTodoCount()
         }
     })
 
     col.appendChild(p)
     col.appendChild(deleteBtn)
     row.appendChild(col)
 
      
 
     container.appendChild(row)
 
     checkTodoCount() //bu fonkisoyun birde todo ekleme işleminden sonra yapıcaz.
}