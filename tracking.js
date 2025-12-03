/**
 * POA Caps - Enterprise Tracking System
 * Meta Pixel + Google Ads + Enhanced Conversions
 *
 * Pixel Meta: 1390346561755451
 * Google Ads: AW-716858468
 * Conversion Label: 4Ua3CLfUx5IYEOTI6dUC
 */

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        meta_pixel_id: '1390346561755451',
        google_ads_id: 'AW-716858468',
        conversion_label: '4Ua3CLfUx5IYEOTI6dUC',
        conversion_value: 150.00, // Valor médio estimado de um lead qualificado
        currency: 'BRL',
        debug: false // Mudar para true para ver logs no console
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function log(message, data) {
        if (CONFIG.debug) {
            console.log('[POA Tracking]', message, data || '');
        }
    }

    // Generate unique client ID
    function getClientId() {
        let clientId = localStorage.getItem('poa_client_id');
        if (!clientId) {
            clientId = 'poa_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('poa_client_id', clientId);
        }
        return clientId;
    }

    // Generate session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem('poa_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('poa_session_id', sessionId);
        }
        return sessionId;
    }

    // ========================================
    // UTM TRACKING
    // ========================================

    function captureUTMParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = {
            utm_source: urlParams.get('utm_source') || '(direct)',
            utm_medium: urlParams.get('utm_medium') || '(none)',
            utm_campaign: urlParams.get('utm_campaign') || '(not set)',
            utm_content: urlParams.get('utm_content') || '',
            utm_term: urlParams.get('utm_term') || '',
            gclid: urlParams.get('gclid') || '',
            fbclid: urlParams.get('fbclid') || '',
            landing_page: window.location.pathname,
            referrer: document.referrer || '(direct)',
            timestamp: new Date().toISOString()
        };

        // Store first touch attribution
        if (!localStorage.getItem('poa_first_touch')) {
            localStorage.setItem('poa_first_touch', JSON.stringify(utmParams));
        }

        // Always update last touch attribution
        sessionStorage.setItem('poa_last_touch', JSON.stringify(utmParams));

        return utmParams;
    }

    function getAttribution() {
        return {
            first_touch: JSON.parse(localStorage.getItem('poa_first_touch') || '{}'),
            last_touch: JSON.parse(sessionStorage.getItem('poa_last_touch') || '{}')
        };
    }

    // ========================================
    // DATALAYER STRUCTURE (GTM Ready)
    // ========================================

    window.dataLayer = window.dataLayer || [];

    function pushToDataLayer(event, data) {
        const payload = {
            event: event,
            client_id: getClientId(),
            session_id: getSessionId(),
            page_url: window.location.href,
            page_title: document.title,
            timestamp: new Date().toISOString(),
            ...data
        };
        window.dataLayer.push(payload);
        log('DataLayer push:', payload);
    }

    // ========================================
    // CTA MAPPING (Para saber qual botão converte)
    // ========================================

    function getCTAPosition(element) {
        // Identifica a seção/posição do CTA
        const sections = {
            'hero': 'Hero Section',
            'modalidades': 'Modalidades Section',
            'portfolio': 'Portfolio Section',
            'cta-section': 'CTA Section',
            'contact': 'Contact Section',
            'whatsapp-float': 'Float Button',
            'exit-modal': 'Exit Intent Modal',
            'footer': 'Footer'
        };

        // Verifica se é o botão flutuante
        if (element.classList.contains('whatsapp-float')) {
            return { position: 'float_button', section: 'Float Button', priority: 'high' };
        }

        // Encontra a seção pai
        let parent = element.closest('section') || element.closest('div[class*="modal"]') || element.closest('footer');

        if (parent) {
            for (const [className, sectionName] of Object.entries(sections)) {
                if (parent.classList.contains(className) || parent.id === className) {
                    return {
                        position: className,
                        section: sectionName,
                        priority: className === 'hero' ? 'high' : 'medium'
                    };
                }
            }
        }

        // Tenta identificar pelo contexto
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const absoluteTop = rect.top + scrollTop;
        const pageHeight = document.documentElement.scrollHeight;
        const percentage = (absoluteTop / pageHeight) * 100;

        if (percentage < 20) return { position: 'top', section: 'Top Section', priority: 'high' };
        if (percentage < 50) return { position: 'middle_top', section: 'Middle Top', priority: 'medium' };
        if (percentage < 80) return { position: 'middle_bottom', section: 'Middle Bottom', priority: 'medium' };
        return { position: 'bottom', section: 'Bottom Section', priority: 'low' };
    }

    function getCTAText(element) {
        return element.textContent.trim().substring(0, 50) || 'WhatsApp CTA';
    }

    // ========================================
    // ENHANCED CONVERSION DATA
    // ========================================

    function getEnhancedConversionData() {
        // Dados para Enhanced Conversions do Google
        // Em produção, isso viria de um formulário preenchido
        return {
            // Deixar vazio - será preenchido se houver formulário
        };
    }

    // ========================================
    // META PIXEL EVENTS
    // ========================================

    function trackMetaEvent(eventName, params) {
        if (typeof fbq !== 'undefined') {
            const attribution = getAttribution();
            const enrichedParams = {
                ...params,
                client_id: getClientId(),
                session_id: getSessionId(),
                utm_source: attribution.last_touch.utm_source,
                utm_medium: attribution.last_touch.utm_medium,
                utm_campaign: attribution.last_touch.utm_campaign
            };

            if (eventName === 'Lead' || eventName === 'Purchase' || eventName === 'InitiateCheckout') {
                fbq('track', eventName, enrichedParams);
            } else {
                fbq('trackCustom', eventName, enrichedParams);
            }
            log('Meta Event:', { event: eventName, params: enrichedParams });
        }
    }

    // ========================================
    // GOOGLE ADS EVENTS
    // ========================================

    function trackGoogleEvent(eventName, params) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
            log('Google Event:', { event: eventName, params: params });
        }
    }

    function trackGoogleConversion(value, transactionId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': CONFIG.google_ads_id + '/' + CONFIG.conversion_label,
                'value': value || CONFIG.conversion_value,
                'currency': CONFIG.currency,
                'transaction_id': transactionId || getSessionId()
            });
            log('Google Conversion tracked:', { value: value, id: transactionId });
        }
    }

    // ========================================
    // LEAD TRACKING (Principal conversão)
    // ========================================

    function trackLead(ctaData) {
        const attribution = getAttribution();
        const transactionId = 'lead_' + Date.now();

        // DataLayer
        pushToDataLayer('generate_lead', {
            lead_id: transactionId,
            lead_source: 'whatsapp',
            cta_position: ctaData.position,
            cta_section: ctaData.section,
            cta_text: ctaData.text,
            value: CONFIG.conversion_value,
            currency: CONFIG.currency,
            attribution: attribution.last_touch
        });

        // Meta Pixel - Lead Event
        trackMetaEvent('Lead', {
            content_name: ctaData.section,
            content_category: 'WhatsApp Lead',
            cta_position: ctaData.position,
            value: CONFIG.conversion_value,
            currency: CONFIG.currency
        });

        // Meta Pixel - InitiateCheckout (evento adicional para otimização)
        trackMetaEvent('InitiateCheckout', {
            content_name: 'Orçamento WhatsApp',
            content_category: ctaData.section,
            value: CONFIG.conversion_value,
            currency: CONFIG.currency,
            num_items: 1
        });

        // Google Ads Conversion
        trackGoogleConversion(CONFIG.conversion_value, transactionId);

        // Google Analytics Event
        trackGoogleEvent('generate_lead', {
            event_category: 'Lead',
            event_label: ctaData.section,
            value: CONFIG.conversion_value,
            cta_position: ctaData.position
        });

        // Store lead for attribution analysis
        const leads = JSON.parse(localStorage.getItem('poa_leads') || '[]');
        leads.push({
            id: transactionId,
            timestamp: new Date().toISOString(),
            cta: ctaData,
            attribution: attribution
        });
        localStorage.setItem('poa_leads', JSON.stringify(leads.slice(-10))); // Keep last 10
    }

    // ========================================
    // MICRO-CONVERSIONS (Funil)
    // ========================================

    const microConversions = {
        heroViewed: false,
        modalidadesViewed: false,
        portfolioViewed: false,
        testimonialsViewed: false,
        faqViewed: false,
        ctaSectionViewed: false,
        contactViewed: false
    };

    function trackMicroConversion(name, section) {
        if (microConversions[name]) return;
        microConversions[name] = true;

        // Calculate funnel step
        const funnelOrder = ['heroViewed', 'modalidadesViewed', 'portfolioViewed', 'testimonialsViewed', 'ctaSectionViewed', 'contactViewed'];
        const step = funnelOrder.indexOf(name) + 1;

        pushToDataLayer('funnel_step', {
            funnel_name: 'landing_page',
            step_number: step,
            step_name: name,
            section: section
        });

        trackMetaEvent('ViewContent', {
            content_name: section,
            content_type: 'landing_page_section',
            content_ids: [name],
            funnel_step: step
        });

        trackGoogleEvent('view_item', {
            event_category: 'Funnel',
            event_label: section,
            value: step
        });
    }

    // ========================================
    // ENGAGEMENT TRACKING
    // ========================================

    // Scroll Depth
    const scrollMilestones = { 25: false, 50: false, 75: false, 90: false };

    function trackScrollDepth() {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);

        Object.keys(scrollMilestones).forEach(function(milestone) {
            if (scrollPercent >= parseInt(milestone) && !scrollMilestones[milestone]) {
                scrollMilestones[milestone] = true;

                pushToDataLayer('scroll_depth', {
                    depth_percentage: milestone,
                    depth_pixels: window.scrollY
                });

                trackMetaEvent('ScrollDepth', {
                    depth: milestone + '%',
                    page_height: document.documentElement.scrollHeight
                });

                trackGoogleEvent('scroll', {
                    event_category: 'Engagement',
                    event_label: milestone + '%',
                    value: parseInt(milestone)
                });

                // Milestone importante - usuário engajado
                if (milestone === '50') {
                    trackMetaEvent('EngagedUser', { type: 'scroll_50' });
                }
                if (milestone === '90') {
                    trackMetaEvent('HighIntent', { type: 'scroll_90' });
                }
            }
        });
    }

    // Time on Page
    const timeThresholds = [
        { time: 15000, label: '15s', event: 'time_15s' },
        { time: 30000, label: '30s', event: 'time_30s' },
        { time: 60000, label: '1min', event: 'time_1min' },
        { time: 120000, label: '2min', event: 'time_2min' },
        { time: 180000, label: '3min', event: 'time_3min' }
    ];

    function initTimeTracking() {
        timeThresholds.forEach(function(threshold) {
            setTimeout(function() {
                pushToDataLayer('time_on_page', {
                    duration: threshold.label,
                    duration_ms: threshold.time
                });

                trackMetaEvent('TimeOnPage', {
                    duration: threshold.label,
                    engaged: threshold.time >= 30000
                });

                trackGoogleEvent('timing_complete', {
                    event_category: 'Engagement',
                    event_label: threshold.label,
                    value: threshold.time / 1000
                });

                // Marca usuário como engajado após 30s
                if (threshold.time === 30000) {
                    trackMetaEvent('EngagedUser', { type: 'time_30s' });
                }
                // Alta intenção após 2min
                if (threshold.time === 120000) {
                    trackMetaEvent('HighIntent', { type: 'time_2min' });
                }
            }, threshold.time);
        });
    }

    // ========================================
    // EXIT INTENT TRACKING
    // ========================================

    let exitIntentTracked = false;

    function trackExitIntent() {
        if (exitIntentTracked) return;
        exitIntentTracked = true;

        pushToDataLayer('exit_intent', {
            scroll_depth: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
            time_on_page: Math.round((Date.now() - pageLoadTime) / 1000)
        });

        trackMetaEvent('ExitIntent', {
            scroll_reached: Object.keys(scrollMilestones).filter(k => scrollMilestones[k]).pop() || '0',
            sections_viewed: Object.keys(microConversions).filter(k => microConversions[k]).length
        });

        trackGoogleEvent('exit_intent', {
            event_category: 'Engagement',
            event_label: 'Desktop Exit'
        });
    }

    // ========================================
    // SECTION OBSERVER
    // ========================================

    function initSectionObserver() {
        const sectionMap = {
            'hero': 'heroViewed',
            'modalidades': 'modalidadesViewed',
            'portfolio': 'portfolioViewed',
            'testimonials': 'testimonialsViewed',
            'faq': 'faqViewed',
            'cta-section': 'ctaSectionViewed',
            'contact': 'contactViewed'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const classList = entry.target.classList;
                    const sectionId = entry.target.id;

                    for (const [className, eventName] of Object.entries(sectionMap)) {
                        if (classList.contains(className) || sectionId === className) {
                            trackMicroConversion(eventName, className);
                            break;
                        }
                    }
                }
            });
        }, { threshold: 0.3 });

        // Observe all major sections
        document.querySelectorAll('section, .hero, .modalidades, .portfolio, .testimonials, .faq, .cta-section, .contact').forEach(function(section) {
            observer.observe(section);
        });
    }

    // ========================================
    // CTA CLICK HANDLERS
    // ========================================

    function initCTATracking() {
        document.querySelectorAll('a[href*="wa.me"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                const ctaData = {
                    ...getCTAPosition(this),
                    text: getCTAText(this),
                    url: this.href
                };

                trackLead(ctaData);
            });
        });

        // Track other important clicks
        document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                const type = this.href.startsWith('tel:') ? 'phone' : 'email';

                pushToDataLayer('contact_click', {
                    contact_type: type,
                    contact_value: this.href
                });

                trackMetaEvent('Contact', {
                    content_name: type,
                    content_category: 'Contact'
                });

                trackGoogleEvent('contact', {
                    event_category: 'Contact',
                    event_label: type
                });
            });
        });
    }

    // ========================================
    // PAGE VISIBILITY (Tab switching)
    // ========================================

    let hiddenTime = 0;
    let lastHidden = null;

    function initVisibilityTracking() {
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                lastHidden = Date.now();
            } else if (lastHidden) {
                hiddenTime += Date.now() - lastHidden;

                pushToDataLayer('page_visibility', {
                    action: 'returned',
                    hidden_duration: Date.now() - lastHidden
                });
            }
        });
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    const pageLoadTime = Date.now();

    function init() {
        // Capture UTM parameters
        const utmParams = captureUTMParams();

        // Push initial page view data
        pushToDataLayer('page_view', {
            page_type: 'landing_page',
            page_name: 'POA Caps - Home',
            ...utmParams
        });

        // Initialize all tracking
        initCTATracking();
        initSectionObserver();
        initTimeTracking();
        initVisibilityTracking();

        // Scroll tracking with throttle
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(function() {
                scrollTimeout = null;
                trackScrollDepth();
            }, 100);
        });

        // Exit intent (desktop only)
        if (window.innerWidth > 768) {
            document.addEventListener('mouseout', function(e) {
                if (e.clientY < 10 && e.relatedTarget === null) {
                    trackExitIntent();
                }
            });
        }

        // Track before unload
        window.addEventListener('beforeunload', function() {
            const sessionDuration = Math.round((Date.now() - pageLoadTime) / 1000);

            // Use sendBeacon for reliable tracking on page exit
            if (navigator.sendBeacon) {
                const data = JSON.stringify({
                    event: 'session_end',
                    duration: sessionDuration,
                    scroll_max: Object.keys(scrollMilestones).filter(k => scrollMilestones[k]).pop() || '0',
                    sections_viewed: Object.keys(microConversions).filter(k => microConversions[k]).length,
                    client_id: getClientId(),
                    session_id: getSessionId()
                });
                navigator.sendBeacon('/api/track', data); // Opcional - requer endpoint
            }
        });

        log('POA Caps Enterprise Tracking Initialized', {
            meta_pixel: CONFIG.meta_pixel_id,
            google_ads: CONFIG.google_ads_id,
            client_id: getClientId(),
            session_id: getSessionId(),
            utm: utmParams
        });

        // Console message for verification
        console.log('%c POA Caps Tracking Active ', 'background: #00D98E; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
        console.log('Meta Pixel:', CONFIG.meta_pixel_id);
        console.log('Google Ads:', CONFIG.google_ads_id);
        console.log('Client ID:', getClientId());
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
