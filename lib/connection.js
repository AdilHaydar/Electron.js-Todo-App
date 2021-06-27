const mysql = require('mysql')

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'electronjs_todo'
})

connection.connect()

module.exports = {
    db : connection
} 
//bu db bağlantısını ayrı bir dosyada yazdık, bunu başka yerde kullanmak için exports ediyoruz ve db adı ile ulaşacağımız için db anahtar kelimesine atıyoruz.