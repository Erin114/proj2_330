const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="styles/default-styles.css">

<style> 
@import url('https://fonts.googleapis.com/css2?family=Heebo&display=swap'); 
* {
  font-family: 'Heebo', verdana
}
</style>

<nav class="navbar has-shadow is-info is-dark">
<div class="navbar-brand">
  <a class="navbar-burger" id="burger">
    <span></span>
    <span></span>
    <span></span>
  </a>
</div>

<div class="navbar-menu" id="nav-links">
    <div class="navbar-start">
        <a class="navbar-item is-hoverable" href="./index.html">
          Home
        </a>
    
        <a class="navbar-item is-hoverable" href="./app.html">
          App
        </a>
    
        <a class="navbar-item is-hoverable" href="./documentation.html">
          Documentation
        </a>
    </div>
</div>
</nav>
`;

class AudioNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const burgerIcon = this.shadowRoot.querySelector("#burger");
        const navbarMenu = this.shadowRoot.querySelector("#nav-links");
        
        let curUrl = window.location.href;
        let url = curUrl.split("/");
        let navLinks = this.shadowRoot.querySelectorAll(".navbar-item");

        switch ("./" + url[url.length - 1]) {
            case "./index.html" :
                navLinks[0].classList.add("has-text-weight-bold");
                break;
            case "./app.html" :
                navLinks[1].classList.add("has-text-weight-bold");
                break;
            case "./documentation.html" :
                navLinks[2].classList.add("has-text-weight-bold");
                break;
            default:
                break;
        }

        burgerIcon.addEventListener('click', () => {
            navbarMenu.classList.toggle('is-active');
        });
    }
}

customElements.define('av-nav', AudioNav);