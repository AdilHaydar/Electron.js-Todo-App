const electron = require("electron")

// url ve path sayfaları oluştururken html sayfalarını belirtmek için
const url = require("url")
const path = require('path');
const db = require('./lib/connection').db //connection dosyasından db anahtar kelimesi ile çıkardığımız için .db koyduk.

const { app, BrowserWindow, Menu, ipcMain } = electron
//ipcMain backendden ipcRenderer ile gelen veriyi yakalamada kullanılır.
let mainWindow, addWindow
//let todoList = new Array()



app.on('ready', () => {


    mainWindow = new BrowserWindow({
        //frame: false //bu değer verildiği taktirde açma kapama düğmelerinin olduğu çerçeve olmadan açılır pencere.
        webPreferences: {
            nodeIntegration: true, //require komutu ile electron'u html sayfasında import edebilmek için bu kısmı eklemem gerekiyor.
            contextIsolation: false,
        }
    })

    mainWindow.setResizable(false) //bu belirtildiği zaman pencere boyutunu değiştiremiyoruz.

    // Pencerenin oluşturulması
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/mainWindow.html"),
            protocol: "file:",
            slashes: true,
        })
    )
    
    //Menu'nun oluşturulması
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    //NewTODO Penceresi eventleri

    ipcMain.on('newTodo:close', () => {
        addWindow.close()
        addWindow = null
    })

    ipcMain.on('todo:close', () => {
        app.quit()
    })

    ipcMain.on('newTodo:save', (err, data) => {
        if(data){

            db.query('Insert Into todos SET text = ?', data.todoValue, (e,r,f) => {
                if(r.insertId > 0){
                    mainWindow.webContents.send('todo:addItem', {
                        id : r.insertId,
                        text : data.todoValue
                    }) //bu fonksiyon backend'den front'ende veri göndermeye yarıyor.
                }
            })

            if(data.ref === 'new'){
                addWindow.close()
                addWindow = null
            }
            
        }
    })

    ipcMain.on('remove:todo', (err, id) => {
        db.query("DELETE FROM todos WHERE id = ?", id, (err,results,fields) => {
            if(results.affectedRows > 0){
                console.log("Silme İşlemi Başarılı")
            }else {
                console.log("Silme işlemi sırasında bir hata oluştu!!!")
            }
        })
    })

    //webContent yüklenmişse bu fonku çalıştır diyoruz ve db işlemini bunun içerisindeki fonkda çalıştırıyoruz.
    mainWindow.webContents.once('dom-ready', () => {
        db.query("SELECT * FROM todos", (error, results, fields) => {
            mainWindow.webContents.send("init", results)
        })
    }) 
})


// Menü template yapısı
const mainMenuTemplate = [
    {
        label: 'Dosya',
        submenu: [
            {
                label: 'Yeni TODO Ekle',
                click(){
                    createWindow()
                }
            },
            {
                label: 'Tümünü Sil'
            },
            {
                label: 'Çıkış',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : "Ctrl+Q", // mac ise Command+Q'yu değil ise Ctrl+Q ile kısayolu tanımladık buraya.
                role: 'quit' //direkt uygulamayı kapatan ön tanımlı rol.
            }
        ]
    },
]
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({
        label : app.getName(),
        role : 'TODO' //tıklanabilir ön tanımlı rol.
    })
}
if(process.env_NODE_ENV !== "production"){ 
    mainMenuTemplate.push(
         {
        label : 'Geliştirici Araçları',
        submenu: [
            {
                label : "Geliştirici Araçları",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools() //butona tıklandığında hangi pencere odaklanıcağız, tıkladığımızda başka pencere açabiliriz onu belirtiyoruz. biz geliştirici menüsü (browserdaki ile aynı) olarak belirtiyoruz bunu.

                },
            },
            {
                label: 'Yenile',
                role: 'reload', //otomatik kısayol tanımladı ve sayfayı yenilemeye yarıyor adından anlaşılacağı üzere.
            }
            
        ]
    }
    )
}


function createWindow(){
    addWindow = new BrowserWindow({
        width: 480,
        height: 175,
        title: 'Yeni Bir Pencere',
        frame: false,
        webPreferences: {
            nodeIntegration: true, //require komutu ile electron'u html sayfasında import edebilmek için bu kısmı eklemem gerekiyor.
            contextIsolation: false,
        }
    })

    addWindow.setResizable(false)

    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/newTodo.html"),
            protocol: "file:",
            slashes: true
        })
    )

    addWindow.on('close', () => {
        addWindow = null //bunu kapattığımızda bellekte yer kaplamaması için bu pencerenin değişkenini null yapıyoruz.
    })
}

