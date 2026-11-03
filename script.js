document.addEventListener('DOMContentLoaded', () => {
    
       // --- cursor y navegacion ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        cursorOutline.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 500, fill: "forwards" });
    });

    const clickables = document.querySelectorAll('a, button, input, select, textarea');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.5rem 5%';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.padding = '1rem 5%';
            navbar.style.boxShadow = 'none';
        }
    });

    // --- 2. efecto tarjetas ---
    const tiltCards = document.querySelectorAll('.tilt-efect');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // --- tanque, burbujas y olas ---
    const tanque = document.getElementById('interactive-tank');
    const liquido = document.getElementById('liquid');
    const bubbleContainer = document.getElementById('bubble-container');

    if (tanque && liquido) {
        function crearBurbuja() {
            const burbuja = document.createElement('div');
            burbuja.classList.add('burbuja');
            const size = Math.random() * 4 + 2;
            burbuja.style.width = `${size}px`;
            burbuja.style.height = `${size}px`;
            burbuja.style.left = `${Math.random() * 100}%`;
            burbuja.style.animationDuration = `${Math.random() * 3 + 2}s`;
            
            bubbleContainer.appendChild(burbuja);
            setTimeout(() => { burbuja.remove(); }, 5000);
        }

        let intervaloBurbujas = setInterval(crearBurbuja, 300);

        tanque.addEventListener('mousemove', (e) => {
            const rect = tanque.getBoundingClientRect();
            const xRelativo = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            liquido.style.transform = `rotate(${xRelativo * 8}deg)`;
            
            clearInterval(intervaloBurbujas);
            intervaloBurbujas = setInterval(crearBurbuja, 100);
        });

        tanque.addEventListener('mouseleave', () => {
            liquido.style.transform = `rotate(0deg)`;
            clearInterval(intervaloBurbujas);
            intervaloBurbujas = setInterval(crearBurbuja, 300);
        });
    }

    // --- 4.logica del formulario ---
    const selectServicio = document.getElementById('servicio_id');
    const cajaOtra = document.getElementById('caja-otra');
    const inputOtra = document.getElementById('otra_opcion');

    if (selectServicio) {
        selectServicio.addEventListener('change', (e) => {
            if (e.target.value === 'otra') {
                cajaOtra.style.display = 'block';
                setTimeout(() => { cajaOtra.style.opacity = '1'; cajaOtra.style.transform = 'translateY(0)'; }, 10);
                inputOtra.required = true;
            } else {
                cajaOtra.style.display = 'none';
                inputOtra.required = false;
                inputOtra.value = ''; 
            }
        });
    }

 // validacion y envio a la base dde datos api rest
    const formHydroMesh = document.getElementById('form-hydromesh');
    const modalExito = document.getElementById('modal-exito');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const panelErrores = document.getElementById('form-errores');

    if (formHydroMesh) {
        formHydroMesh.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            panelErrores.innerHTML = '';
            panelErrores.classList.add('hidden');
            let errores = [];

            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const asunto = document.getElementById('asunto').value.trim();
            const servicio_id = document.getElementById('servicio_id').value;
            const mensaje = document.getElementById('mensaje').value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errores.push("El formato del correo electrónico no es válido.");
            }

            if (mensaje.length < 20) {
                errores.push("El mensaje debe contener al menos 20 caracteres para poder procesarlo.");
            }

            if (errores.length > 0) {
                panelErrores.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + errores.join('<br><i class="fas fa-exclamation-triangle"></i> ');
                panelErrores.classList.remove('hidden');
                return; 
            }
            
            const btnSubmit = document.querySelector('.btn-submit-cyber');
            const originalText = btnSubmit.innerHTML;
            
            btnSubmit.innerHTML = 'Guardando consulta... <i class="fas fa-circle-notch fa-spin"></i>';
            btnSubmit.style.background = 'var(--gris-titanio)';
            btnSubmit.style.color = 'var(--cian-neon)';
            btnSubmit.style.border = '1px solid var(--cian-neon)';

            try {
                const response = await fetch('http://localhost:3000/api/consultas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, telefono, asunto, servicio_id, mensaje })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al enviar la consulta');
                }

                formHydroMesh.reset();
                cajaOtra.style.display = 'none';
                inputOtra.required = false;
                modalExito.classList.add('active');
            } catch (err) {
                panelErrores.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${err.message}`;
                panelErrores.classList.remove('hidden');
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.style = '';
            }
        });
    }

if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
            modalExito.classList.remove('active');
        });
    }
});