"use strict";

(function initApp() {
    const pokemonSlides = [
        {
            id: 25,
            name: "Pikachu",
            type: "Electrico",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
            note: "Icono clasico y veloz del universo Pokemon."
        },
        {
            id: 6,
            name: "Charizard",
            type: "Fuego / Volador",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
            note: "Potencia ofensiva alta y gran presencia visual."
        },
        {
            id: 9,
            name: "Blastoise",
            type: "Agua",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
            note: "Defensa fuerte con gran equilibrio tactico."
        },
        {
            id: 3,
            name: "Venusaur",
            type: "Planta / Veneno",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
            note: "Control de campo y resistencia sostenida."
        },
        {
            id: 150,
            name: "Mewtwo",
            type: "Psiquico",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
            note: "Pokemon legendario con enfoque en poder mental."
        }
    ];

    const appState = {
        currentSlide: 0,
        submissions: {
            register: [],
            loginAttempts: [],
            contacts: []
        }
    };

    const dom = {
        image: document.getElementById("pokemon-image"),
        name: document.getElementById("pokemon-name"),
        meta: document.getElementById("pokemon-meta"),
        indicators: document.getElementById("slider-indicators"),
        prevBtn: document.getElementById("prev-slide"),
        nextBtn: document.getElementById("next-slide"),
        shuffleBtn: document.getElementById("shuffle-slide"),
        activityLog: document.getElementById("activity-log"),
        registerForm: document.getElementById("register-form"),
        loginForm: document.getElementById("login-form"),
        contactForm: document.getElementById("contact-form"),
        dittoImg: document.getElementById("dittoImg"),
        dittoName: document.getElementById("dittoName"),
        dittoInfo: document.getElementById("dittoInfo"),
        dittoAbilities: document.getElementById("dittoAbilities"),
        dittoFlavor: document.getElementById("dittoFlavor")
    };

    function capitalize(value) {
        const text = String(value ?? "");
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
    }

    function safeText(value) {
        return String(value ?? "").replace(/[<>]/g, "").trim();
    }

    function normalizeSpace(value) {
        return safeText(value).replace(/\s+/g, " ");
    }

    function isValidEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(value);
    }

    function isStrongPassword(value) {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasDigit = /\d/.test(value);
        return value.length >= 8 && hasUpper && hasLower && hasDigit;
    }

    function setFieldError(input, message) {
        const errorNode = document.querySelector('[data-error-for="' + input.id + '"]');
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        if (errorNode) {
            errorNode.textContent = message;
        }
    }

    function clearFieldError(input) {
        const errorNode = document.querySelector('[data-error-for="' + input.id + '"]');
        input.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
        if (errorNode) {
            errorNode.textContent = "";
        }
    }

    function buildIndicators() {
        dom.indicators.innerHTML = "";

        pokemonSlides.forEach(function buildIndicator(slide, index) {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = String(index + 1);
            button.dataset.slideIndex = String(index);
            button.setAttribute("aria-label", "Ver " + slide.name);
            button.addEventListener("click", function onIndicatorClick() {
                goToSlide(index);
            });
            item.appendChild(button);
            dom.indicators.appendChild(item);
        });
    }

    function renderSlide() {
        const slide = pokemonSlides[appState.currentSlide];

        dom.image.src = slide.image;
        dom.image.alt = "Carta de " + slide.name;
        dom.image.setAttribute("data-pokemon-id", String(slide.id));

        dom.name.textContent = slide.name;
        dom.meta.textContent = "Tipo: " + slide.type + " | " + slide.note;

        const indicatorButtons = dom.indicators.querySelectorAll("button");
        indicatorButtons.forEach(function updateIndicator(button, index) {
            const isActive = index === appState.currentSlide;
            button.setAttribute("aria-selected", String(isActive));
            button.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function goToSlide(index) {
        const max = pokemonSlides.length - 1;
        if (index < 0) {
            appState.currentSlide = max;
        } else if (index > max) {
            appState.currentSlide = 0;
        } else {
            appState.currentSlide = index;
        }
        renderSlide();
    }

    function setupCarouselEvents() {
        dom.prevBtn.addEventListener("click", function onPrev() {
            goToSlide(appState.currentSlide - 1);
        });

        dom.nextBtn.addEventListener("click", function onNext() {
            goToSlide(appState.currentSlide + 1);
        });

        dom.shuffleBtn.addEventListener("click", function onShuffle() {
            const nextIndex = Math.floor(Math.random() * pokemonSlides.length);
            goToSlide(nextIndex);
        });
    }

    function addSubmissionRecord(type, payload) {
        appState.submissions[type].push(payload);

        const registerCount = appState.submissions.register.length;
        const loginCount = appState.submissions.loginAttempts.length;
        const contactCount = appState.submissions.contacts.length;

        if (dom.activityLog) {
            dom.activityLog.textContent =
                "Registros: " + registerCount +
                " | Logins: " + loginCount +
                " | Contactos: " + contactCount;
        }
    }

    function getFormValues(form, fields) {
        return fields.reduce(function collect(acc, field) {
            const sourceValue = form.elements[field] ? form.elements[field].value : "";
            acc[field] = normalizeSpace(sourceValue);
            return acc;
        }, {});
    }

    function validateRegister(values, form) {
        let isValid = true;

        const nameInput = form.elements.fullName;
        const emailInput = form.elements.email;
        const passwordInput = form.elements.password;

        clearFieldError(nameInput);
        clearFieldError(emailInput);
        clearFieldError(passwordInput);

        if (values.fullName.length < 3) {
            setFieldError(nameInput, "Ingresa un nombre valido de al menos 3 caracteres.");
            isValid = false;
        }

        if (!isValidEmail(values.email)) {
            setFieldError(emailInput, "Formato de correo no valido.");
            isValid = false;
        }

        if (!isStrongPassword(values.password)) {
            setFieldError(passwordInput, "Debe tener 8+ caracteres, mayuscula, minuscula y numero.");
            isValid = false;
        }

        return isValid;
    }

    function validateLogin(values, form) {
        let isValid = true;

        const emailInput = form.elements.email;
        const passwordInput = form.elements.password;

        clearFieldError(emailInput);
        clearFieldError(passwordInput);

        if (!isValidEmail(values.email)) {
            setFieldError(emailInput, "Correo invalido para inicio de sesion.");
            isValid = false;
        }

        if (values.password.length < 8) {
            setFieldError(passwordInput, "La contrasena debe tener minimo 8 caracteres.");
            isValid = false;
        }

        return isValid;
    }

    function validateContact(values, form) {
        let isValid = true;

        const nameInput = form.elements.name;
        const emailInput = form.elements.email;
        const messageInput = form.elements.message;

        clearFieldError(nameInput);
        clearFieldError(emailInput);
        clearFieldError(messageInput);

        if (values.name.length < 3) {
            setFieldError(nameInput, "El nombre debe tener al menos 3 caracteres.");
            isValid = false;
        }

        if (!isValidEmail(values.email)) {
            setFieldError(emailInput, "Correo de contacto invalido.");
            isValid = false;
        }

        if (values.message.length < 15) {
            setFieldError(messageInput, "El mensaje debe tener al menos 15 caracteres.");
            isValid = false;
        }

        if (/(<script|javascript:|onerror=|onload=)/i.test(values.message)) {
            setFieldError(messageInput, "Contenido potencialmente inseguro detectado.");
            isValid = false;
        }

        return isValid;
    }

    function setupRegisterForm() {
        dom.registerForm.addEventListener("submit", function onRegisterSubmit(event) {
            event.preventDefault();
            const values = getFormValues(dom.registerForm, ["fullName", "email", "password"]);

            if (!validateRegister(values, dom.registerForm)) {
                return;
            }

            addSubmissionRecord("register", {
                fullName: values.fullName,
                email: values.email,
                createdAt: new Date().toISOString()
            });

            dom.registerForm.reset();
        });
    }

    function setupLoginForm() {
        dom.loginForm.addEventListener("submit", function onLoginSubmit(event) {
            event.preventDefault();
            const values = getFormValues(dom.loginForm, ["email", "password"]);

            if (!validateLogin(values, dom.loginForm)) {
                return;
            }

            addSubmissionRecord("loginAttempts", {
                email: values.email,
                createdAt: new Date().toISOString()
            });

            dom.loginForm.reset();
        });
    }

    function setupContactForm() {
        dom.contactForm.addEventListener("submit", function onContactSubmit(event) {
            event.preventDefault();
            const values = getFormValues(dom.contactForm, ["name", "email", "message"]);

            if (!validateContact(values, dom.contactForm)) {
                return;
            }

            addSubmissionRecord("contacts", {
                name: values.name,
                email: values.email,
                message: values.message,
                createdAt: new Date().toISOString()
            });

            dom.contactForm.reset();
        });
    }

    async function fetchDitto() {
        if (!dom.dittoImg || !dom.dittoName || !dom.dittoInfo || !dom.dittoAbilities || !dom.dittoFlavor) {
            return;
        }

        try {
            const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
            if (!response.ok) {
                return;
            }

            const pokemon = await response.json();
            const image =
                (pokemon.sprites && pokemon.sprites.other && pokemon.sprites.other["official-artwork"] && pokemon.sprites.other["official-artwork"].front_default) ||
                (pokemon.sprites && pokemon.sprites.front_default) ||
                dom.dittoImg.src;

            const types = (pokemon.types || []).map(function mapType(item) {
                return capitalize(item.type.name);
            }).join(", ");
            const heightM = ((pokemon.height || 0) / 10).toFixed(1);
            const weightKg = ((pokemon.weight || 0) / 10).toFixed(1);
            const abilities = (pokemon.abilities || []).map(function mapAbility(item) {
                return capitalize(item.ability.name);
            }).join(", ");

            dom.dittoImg.src = image;
            dom.dittoImg.alt = pokemon.name || "Ditto";
            dom.dittoName.textContent = capitalize(pokemon.name || "Ditto");
            dom.dittoInfo.textContent = "Tipo: " + (types || "Desconocido") + " - Altura: " + heightM + " m - Peso: " + weightKg + " kg";
            dom.dittoAbilities.textContent = "Habilidades: " + (abilities || "Desconocidas");
            dom.dittoFlavor.textContent = "Pokemon inicial destacado de la pagina.";
        } catch (error) {
            console.warn("No se pudo cargar Ditto:", error);
        }
    }

    function init() {
        buildIndicators();
        renderSlide();
        setupCarouselEvents();
        setupRegisterForm();
        setupLoginForm();
        setupContactForm();
        fetchDitto();
    }

    init();
})();
