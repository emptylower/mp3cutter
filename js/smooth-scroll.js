// 平滑滚动功能
document.addEventListener('DOMContentLoaded', function() {
    // 导航链接平滑滚动
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // 减去导航栏高度
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 滚动提示点击
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', function() {
            const featuresSection = document.querySelector('#features');
            if (featuresSection) {
                const offsetTop = featuresSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    // 导航栏滚动效果
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // 滚动时改变导航栏样式
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });

    // 滚动动画 - Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('.feature-card, .step, .faq-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        .feature-card, .step, .faq-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .feature-card.animate-in, .step.animate-in, .faq-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .step:nth-child(1) { transition-delay: 0s; }
        .step:nth-child(2) { transition-delay: 0.1s; }
        .step:nth-child(3) { transition-delay: 0.2s; }
        .step:nth-child(4) { transition-delay: 0.3s; }
        
        .feature-card:nth-child(1) { transition-delay: 0s; }
        .feature-card:nth-child(2) { transition-delay: 0.1s; }
        .feature-card:nth-child(3) { transition-delay: 0.2s; }
        .feature-card:nth-child(4) { transition-delay: 0.3s; }
        .feature-card:nth-child(5) { transition-delay: 0.4s; }
        .feature-card:nth-child(6) { transition-delay: 0.5s; }
    `;
    document.head.appendChild(style);

    // 高亮当前导航项
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavigation() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // 添加活动导航项样式
    const activeStyle = document.createElement('style');
    activeStyle.textContent = `
        .nav-link.active {
            color: var(--primary-color);
        }
        
        .nav-link.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(activeStyle);
});