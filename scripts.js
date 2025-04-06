import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'
import './BookPreview.js';

let page = 1;
let matches = books


const listItemsContainer = document.querySelector('[data-list-items]');
const listButton = document.querySelector('[data-list-button]');
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchForm = document.querySelector('[data-search-form]');
const searchCancel = document.querySelector('[data-search-cancel]');


/**
 * Creates an HTML element with specified attributes and inner HTML.
 * @param {string} tag - The HTML tag name.
 * @param {Object} attributes - Key-value pairs of attributes.
 * @param {string} innerHTML - The inner HTML content.
 * @returns {HTMLElement} - The created element.
 */
function createElement(tag, attributes = {}, innerHTML = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    element.innerHTML = innerHTML;
    return element;
}

/**
 * Renders a list of book previews into the given container.
 * @param {Array} bookList - The list of books to render.
 * @param {HTMLElement} container - The container element to render into.
 * @param {number} page - The current page number.
 * @param {boolean} append - Whether to append to existing content (default false).
 */
function renderBooks(bookList, container, page = 1, append = false) {
    if (!append) container.innerHTML = ''; // Clear if not appending

    const start = (page - 1) * BOOKS_PER_PAGE;
    const end = page * BOOKS_PER_PAGE;

    const fragment = document.createDocumentFragment();

    bookList.slice(start, end).forEach(book => {
        const previewElement = renderBookPreview(book);
        fragment.appendChild(previewElement);
    });

    container.appendChild(fragment);
}

function renderBookPreview({author, id, image, title}) {
        // Create the book element with necessary attributes and content
        const element = document.createElement('book-preview');
        element.setAttribute('data-id', id);
        element.setAttribute('data-title', title);
        element.setAttribute('data-author', authors[author]);
        element.setAttribute('data-image', image);
        return element;
}




// // document.querySelector('[data-list-items]').appendChild(starting)
// /**
//  * Populates a select dropdown with options.
//  * @param {HTMLElement} selectElement - The select dropdown element.
//  * @param {Object} options - Key-value pairs for dropdown options.
//  * @param {string} defaultText - The default option text.
//  */
// function populateSelect(selectElement, options, defaultText) {
//     const fragment = document.createDocumentFragment();
//     fragment.appendChild(createElement('option', { value: 'any' }, defaultText));
//     Object.entries(options).forEach(([id, name]) => {
//         fragment.appendChild(createElement('option', { value: id }, name));
//     });
//     selectElement.replaceChildren(fragment);
// }

/**
 * Handles theme toggling between light and dark modes.
 * @param {string} theme - Selected theme ('day' or 'night').
 */
function applyTheme(theme) {
    const isNight = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
    document.querySelector('[data-settings-theme]').value = theme;

    // Persist theme in localStorage
    localStorage.setItem('theme', theme);
}

/**
 * Updates the "Show More" button based on remaining books.
 */
function updateShowMoreButton() {
    const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `<span>Show more</span> <span class="list__remaining">(${remaining})</span>`;
    button.disabled = remaining === 0;
}

function closeOverlay(selector) {
    const overlay = document.querySelector(selector);
    if (overlay) overlay.open = false;
}

function openOverlay(selector, focusSelector = null) {
    const overlay = document.querySelector(selector);
    if (overlay) overlay.open = true;
    if (focusSelector) document.querySelector(focusSelector)?.focus();
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'day';
    applyTheme(savedTheme);

    const container = document.querySelector('[data-list-items]');
    renderBooks(matches, container); // This renders the first page using Web Component
    updateShowMoreButton();
});


document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

function handleThemeSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
}

function handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {
        let genreMatch = filters.genre === 'any';

        for (const singleGenre of book.genres) {
            if (singleGenre === filters.genre) {
                genreMatch = true;
                break;
            }
        }

        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        if (titleMatch && authorMatch && genreMatch) {
            result.push(book);
        }
    }

    page = 1;
    matches = result;

    document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);

    renderBooks(result, listItemsContainer);
    updateShowMoreButton();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
}


document.querySelector('[data-settings-form]').addEventListener('submit', handleThemeSubmit);


document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const book of result.slice(0, BOOKS_PER_PAGE)) {
        const element = renderBookPreview(book);
        newItems.appendChild(element);
    }

    
    
    

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const book of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = renderBookPreview(book);
        fragment.appendChild(element);
    }
    

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})