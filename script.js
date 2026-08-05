/* =========================================================
   VOZINIAK SMART — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. MENU MOBILE ---------- */
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const links = navLinks.querySelectorAll('a');

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        });
    });

    /* ---------- 2. NAVBAR + BARRA DE PROGRESSO ---------- */
    const header = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        // Navbar com fundo ao rolar
        header.classList.toggle('scrolled', window.scrollY > 50);

        // Barra de progresso
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        scrollProgress.style.width = progress + '%';

        // Botão voltar ao topo
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- 3. SCROLL REVEAL ---------- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ---------- 4. EFEITO DE DIGITAÇÃO (TYPEWRITER) ---------- */
    const typewriter = document.getElementById('typewriter');
    const words = ['Inteligente', 'Sustentável', 'Conectada', 'Humana'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typewriter.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriter.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 60 : 120;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // pausa com a palavra completa
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 400;
        }

        setTimeout(type, typeSpeed);
    }

    if (typewriter) type();

    /* ---------- 5. CONTADORES ANIMADOS ---------- */
    const counters = document.querySelectorAll('.counter');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.dataset.target;
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // easing para desacelerar no final
                    const eased = 1 - Math.pow(1 - progress, 3);
                    counter.textContent = Math.floor(eased * target);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    /* ---------- 6. FAQ / ACORDEÃO ---------- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Fecha os outros itens
            faqItems.forEach(other => {
                other.classList.remove('open');
                other.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Abre o atual (se estava fechado)
            if (!isOpen) {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    /* ---------- 7. LINK ATIVO NO MENU ---------- */
    const sections = document.querySelectorAll('section[id]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                links.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(section => sectionObserver.observe(section));

    /* ---------- 8. VALIDAÇÃO DO FORMULÁRIO ---------- */
    const form = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    function setError(input, message) {
        const group = input.closest('.form-group');
        group.classList.add('error');
        group.classList.remove('success');
        group.querySelector('.error-message').textContent = message;
    }

    function setSuccess(input) {
        const group = input.closest('.form-group');
        group.classList.remove('error');
        group.classList.add('success');
        group.querySelector('.error-message').textContent = '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');

        // Nome
        if (name.value.trim().length < 3) {
            setError(name, 'Digite seu nome completo.');
            isValid = false;
        } else {
            setSuccess(name);
        }

        // E-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            setError(email, 'Digite um e-mail válido.');
            isValid = false;
        } else {
            setSuccess(email);
        }

        // Mensagem
        if (message.value.trim().length < 10) {
            setError(message, 'A mensagem deve ter pelo menos 10 caracteres.');
            isValid = false;
        } else {
            setSuccess(message);
        }

        // Se tudo válido, mostra sucesso
        if (isValid) {
            formSuccess.classList.add('show');
            form.reset();

            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 4000);
        }
    });

});