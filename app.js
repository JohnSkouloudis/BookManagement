const db=require('oracledb');
db.outFormat=db.OUT_FORMAT_OBJECT;

async function ConnectDB(){
    let con;
    try {
        con=await db.getConnection({
            user           :"it2021091",
            password       :"it2021091",
            connectString  :"(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = oracle12c.hua.gr)(PORT = 1521))(CONNECT_DATA =(SID= ORCL)))"
        });
        
        
        return con;

    } catch (err) {
        console.error(err);
    }
}



function runQuery(con,q){
    return new Promise((resolve,reject)=>{
        con.execute(q,(err,rows)=>{
            if(err){
                console.log('Error');
                reject(err);
            }
            resolve(rows);
        });
    });
}

class Book{
    constructor (id,title,author,genre,price){
        this.id=id;
        this.title=title;
        this.author=author;
        this.genre=genre;
        this.price=price;
    }
}

async function getMaxId(con){

    const q = 'SELECT MAX(id) as max FROM books';
    const result = await runQuery(con,q);
    const maxId = result.rows[0].MAX;
    console.log('maxId:',maxId,typeof(maxId));

    return  Number(maxId);
}
 
 async function bookExists(con,book){

    const q='SELECT * FROM books ';
    const result = await runQuery(con,q);
    const rows = result.rows;
     

     for( row of rows){
        title = row.TITLE;
        if(title == book.title){
            console.log('book with title:',book.title,' already exists');
            return true;
        }
     }

     return false;
}

async function addBook(con,book){
    try {

        
        
        const maxId = await getMaxId(con);
        console.log('Max ID:', maxId);

        book.id = maxId + 1;
        console.log('New ID:', book.id);

        
        const query = `INSERT INTO books (id,title, author, genre, price) VALUES (:id, :title, :author, :genre, :price)`;
        
        const result = await con.execute(query, {
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          price: book.price
        });
        
        

        const commit=await con.execute('commit');
        console.log('Book inserted successfully');
        
      } catch (err) {
        console.error('Error inserting book:', err);
      }
}

async function getBooksByKeyword(con,keyword){
    
    const q=`SELECT * FROM books WHERE  id LIKE '%${keyword}%' OR title LIKE '%${keyword}%' OR author LIKE '%${keyword}%' OR genre LIKE '%${keyword}%' OR price LIKE '%${keyword}%'`;

    const result = await runQuery(con,q);
    const rows = result.rows;
    books =[];

    for(row of rows){
         book = new Book(row.ID,row.TITLE, row.AUTHOR, row.GENRE, row.PRICE);
        books.push(book);
    }

    return books;
}

async function getAllBooks(con) {
    
    const q='SELECT * FROM books ';
    const result = await runQuery(con,q);
    const rows = result.rows;
    books =[];

    for(row of rows){
         book = new Book(row.ID,row.TITLE, row.AUTHOR, row.GENRE, row.PRICE);
        books.push(book);
    }

    return books;
  }



const express=require('express');
const app=express();
app.use(express.static('public'));

const bodyParser= require('body-parser');
app.use(bodyParser.json());

app.get('/books/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
  
    try {
      const con = await ConnectDB();
      
      const books= await getBooksByKeyword(con,keyword);
  
      res.json(books);
      await con.close();
    } catch (err) {
      res.status(500).send(err);
    }
  });

app.get('/books', async (req,res)=>{

    
    try {
        

        const con = await ConnectDB();
        const books = await getAllBooks(con);
        res.json(books);              
        await con.close();

    }catch (err) {
        res.status(500).send(err);
    }
});



app.post('/books',async(req,res)=>{
    
    try {
        const book=req.body;
        console.log(req.body);

        const con = await ConnectDB();
        
        if( !( await bookExists(con,book) ) ){

        await addBook(con,book);

        }
        res.send('OK');
        
        
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(3000);


    
  

  