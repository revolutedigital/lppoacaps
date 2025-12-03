// Tracking Events Manager
// Meta Pixel + Google Ads Conversion Tracking

document.addEventListener('DOMContentLoaded', function() {

    // Track all WhatsApp CTA clicks
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');

    whatsappLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Meta Pixel - Lead Event
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'WhatsApp CTA Click',
                    content_category: 'Lead Generation'
                });
                console.log('Meta Pixel: Lead event tracked');
            }

            // Google Ads Conversion
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'send_to': 'AW-716858468/4Ua3CLfUx5IYEOTI6dUC',
                    'event_callback': function() {
                        console.log('Google Ads: Conversion tracked');
                    }
                });
            }
        });
    });

    // Track scroll depth (engaged users)
    let scrollTracked = {
        '25': false,
        '50': false,
        '75': false,
        '100': false
    };

    window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        Object.keys(scrollTracked).forEach(function(threshold) {
            if (scrollPercent >= parseInt(threshold) && !scrollTracked[threshold]) {
                scrollTracked[threshold] = true;

                // Track on Meta
                if (typeof fbq !== 'undefined') {
                    fbq('trackCustom', 'ScrollDepth', {
                        depth: threshold + '%'
                    });
                }

                // Track on Google Ads
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll', {
                        'event_category': 'engagement',
                        'event_label': threshold + '%'
                    });
                }
            }
        });
    });

    // Track time on page (engaged users - 30s, 60s, 120s)
    const timeThresholds = [30000, 60000, 120000]; // 30s, 1min, 2min
    const timeLabels = ['30s', '1min', '2min'];

    timeThresholds.forEach(function(time, index) {
        setTimeout(function() {
            // Meta Pixel
            if (typeof fbq !== 'undefined') {
                fbq('trackCustom', 'TimeOnPage', {
                    duration: timeLabels[index]
                });
            }

            // Google Ads
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    'event_category': 'engagement',
                    'event_label': timeLabels[index]
                });
            }
        }, time);
    });

    // Track key sections viewed (ViewContent events)
    const sections = document.querySelectorAll('.modalidades, .portfolio, .testimonials, .faq');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !entry.target.dataset.tracked) {
                entry.target.dataset.tracked = 'true';

                const sectionName = entry.target.className.split(' ')[0];

                // Meta Pixel
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'ViewContent', {
                        content_name: sectionName,
                        content_type: 'section'
                    });
                }

                // Google Ads
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'view_item', {
                        'event_category': 'section_view',
                        'event_label': sectionName
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(function(section) {
        observer.observe(section);
    });

    console.log('POA Caps Tracking initialized - Meta Pixel: 1390346561755451 | Google Ads: AW-716858468');
});
