document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });
    if(isStorageExist()){
        loadDataFromStorage();
    }
});

const books = [];
const RENDER_EVENT = 'render-book';

function addBook(){
    const textBook = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const checkboxCompleteRead = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, textBook, bookAuthor, bookYear, checkboxCompleteRead === true);
    books.push(bookObject); //object on bookObject is pushed to array books

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, bookIsComplete){
    return {
        id,
        title,
        author,
        year,
        bookIsComplete
    }
}

document.addEventListener(RENDER_EVENT, function(){
    //console.log(books);

    //incomplete read
    const incompletedRead = document.getElementById('incompleteBookshelfList');
    incompletedRead.innerHTML = '';

    //complete read
    const completedRead = document.getElementById('completeBookshelfList');
    completedRead.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(!bookItem.bookIsComplete)
            incompletedRead.append(bookElement);
        else
            completedRead.append(bookElement);
    }
});

//make book
function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerHTML = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerHTML = `Penulis: ${bookObject.author}`;

    const numberYear = document.createElement('p');
    numberYear.innerHTML = `Tahun: ${bookObject.year}`;

    const textBook_shelf = document.createElement('section');
    textBook_shelf.classList.add('inner');
    textBook_shelf.append(textTitle, textAuthor, numberYear);

    const book_shelf = document.createElement('section');
    book_shelf.classList.add('item', 'shadow');
    book_shelf.append(textBook_shelf);
    book_shelf.setAttribute('id', `book-${bookObject.id}`);

    //making undo and trash button
    if(bookObject.bookIsComplete){
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.textContent = 'Belum selesai dibaca';

        undoButton.addEventListener('click', function(){
            undoTitleFromComplete(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.textContent = 'Hapus buku';

        trashButton.addEventListener('click', function(){
            removeTitleFromComplete(bookObject.id);
        });

        book_shelf.append(undoButton, trashButton);
    }else{
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.textContent = 'Selesai dibaca';

        checkButton.addEventListener('click', function(){
            addTitleToComplete(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.textContent = 'Hapus buku';

        trashButton.addEventListener('click', function(){
            removeTitleFromComplete(bookObject.id);
        });

        book_shelf.append(checkButton, trashButton);
    }

    return book_shelf;
}

function addTitleToComplete(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.bookIsComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId){
    for(const bookItem of books){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

//hapus
function removeTitleFromComplete(bookId){
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;
    showToast("Buku dihapus");

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

//undo
function undoTitleFromComplete(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.bookIsComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId){
    for(const index in books){
        if(books[index].id === bookId){
            return index;
        }
    }

    return -1;
}


//save to the web storage
function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function isStorageExist() {
    if(typeof (Storage) === undefined){
        alert('Browser tidak mendukung local Storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function(){
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null){
        for(const book of data){
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

//toast
function showToast(message){
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}