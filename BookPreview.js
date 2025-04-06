export class BookPreview extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const id = this.getAttribute('data-id');
        const title = this.getAttribute('data-title');
        const author = this.getAttribute('data-author');
        const image = this.getAttribute('data-image');
    
        this.shadowRoot.innerHTML = `
        <style>
          .preview {
            border: none;
            background: none;
            text-align: left;
            padding: 1rem;
            cursor: pointer;
            display: flex;
            gap: 1rem;
          }
  
          .preview__image {
            width: 80px;
            height: 100px;
            object-fit: cover;
          }
  
          .preview__info {
            display: flex;
            flex-direction: column;
          }
  
          .preview__title {
            font-weight: bold;
          }
  
          .preview__author {
            color: #666;
            font-size: 0.875rem;
          }
        </style>
  
        <button class="preview" data-preview="${id}">
          <img class="preview__image" src="${image}" alt="Book cover" />
          <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${author}</div>
          </div>
        </button>
      `;
    }    
}

customElements.define('book-preview', BookPreview);