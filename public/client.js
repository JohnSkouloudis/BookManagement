

class Book{
    constructor (id,title,author,genre,price){
      this.id=id;
      this.title=title;
      this.author=author;
      this.genre=genre;
      this.price=price;
  }
}



document.getElementById("submitButton").addEventListener('click', async (e)=>{
    const author = document.getElementById('author').value;
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const price = document.getElementById('price').value;

    const book = new Book(null,title,author,genre,price);

    const url = 'http://localhost:3000/books';

    const result = await fetch(url,{
        method:'POST',
        headers : {
          "Content-Type" : "application/json"
        },
        body:JSON.stringify(book)
      });
      
    console.log(result.json);

  });



  document.getElementById("searchButton").addEventListener('click',async (e)=>{
    e.preventDefault();
    const keyword = document.getElementById('keyword').value;

    const url = `http://localhost:3000/books/${encodeURIComponent(keyword)}`;

    const result = await fetch(url,{
      method:'GET',
      headers : {
        "Content-Type" : "application/json"
      }
      
    });
    
    const books = await result.json();
    console.log(books);
    const resultElem = document.getElementById('results');
    resultElem.innerHTML = '';
    for( const book of books){
      resultElem.innerHTML += `<h2>ID: ${book.id}</h2>`;
      resultElem.innerHTML += `<p>Title: ${book.title}</p>`;
      resultElem.innerHTML += `<p>Author: ${book.author}</p>`;
      resultElem.innerHTML += `<p>Genre: ${book.genre}</p>`;
      resultElem.innerHTML += `<p>Price: ${book.price}</p>`;
      resultElem.innerHTML += `<hr>`;
    }

});
