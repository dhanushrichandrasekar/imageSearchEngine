const accessKey = "uGXlPaSBABG1k1coUK5VSa4v_SF3-2kzhkXZEds7w4g";
        const searchForm = document.getElementById("search-form");
        const searchBox = document.getElementById("search-box");
        const searchResult = document.getElementById("search-result");
        const voiceBtn = document.getElementById("voice-btn");
        const loadingIndicator = document.getElementById("loading");
        const showMoreBtn = document.getElementById("show-more-btn");
        const themeToggle = document.getElementById("theme-toggle");
        const suggestionsDropdown = document.getElementById("suggestions-dropdown");
        const scrollTopBtn = document.getElementById("scroll-top");
        const toggleViewBtn = document.getElementById("toggle-view");

        let keyword = "";
        let page = 1;
        let isListening = false;
        let recognition;
        let isGridView = true;

        function initDarkMode() {
            if (localStorage.getItem('darkMode') === 'true' || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('darkMode'))) {
                document.body.classList.add('dark-mode');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            if (isDarkMode) {
                particlesJS('particles-js', darkParticlesConfig);
            } else {
                particlesJS('particles-js', lightParticlesConfig);
            }
        });

        const lightParticlesConfig = {
            particles: {
                number: {
                    value: 70,
                    density: {
                        enable: true,
                        value_area: 500
                    }
                },
                color: {
                    value: "#D4AF37"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.2,
                        sync: false
                    }
                },
                size: {
                    value: 7,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 3,
                        size_min: 3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: "#B08B3E",
                    opacity: 0.4,
                    width: 1.5
                },
                move: {
                    enable: true,
                    speed: 4,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "bounce",
                    bounce: true,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "window",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab",
                        parallax: {
                            enable: true,
                            force: 30,
                            smooth: 15
                        }
                    },
                    onclick: {
                        enable: true,
                        mode: "bubble"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 200,
                        line_linked: {
                            opacity: 0.8
                        }
                    },
                    bubble: {
                        distance: 250,
                        size: 10,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3
                    },
                    push: {
                        particles_nb: 6
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        };

        const darkParticlesConfig = {
            ...lightParticlesConfig,
            particles: {
                ...lightParticlesConfig.particles,
                opacity: {
                    ...lightParticlesConfig.particles.opacity,
                    value: 0.6
                },
                line_linked: {
                    ...lightParticlesConfig.particles.line_linked,
                    opacity: 0.6
                }
            }
        };

        function initParticles() {
            if (document.body.classList.contains('dark-mode')) {
                particlesJS('particles-js', darkParticlesConfig);
            } else {
                particlesJS('particles-js', lightParticlesConfig);
            }
            
            if ('ontouchstart' in window) {
                const updatedConfig = {
                    ...(document.body.classList.contains('dark-mode') ? darkParticlesConfig : lightParticlesConfig),
                    interactivity: {
                        ...(document.body.classList.contains('dark-mode') ? darkParticlesConfig.interactivity : lightParticlesConfig.interactivity),
                        events: {
                            ...(document.body.classList.contains('dark-mode') ? darkParticlesConfig.interactivity.events : lightParticlesConfig.interactivity.events),
                            ontouch: {
                                enable: true,
                                mode: "grab",
                                parallax: {
                                    enable: true,
                                    force: 20,
                                    smooth: 10
                                }
                            }
                        }
                    }
                };
                particlesJS('particles-js', updatedConfig);
            }
        }

        function initVoiceRecognition() {
            if ('webkitSpeechRecognition' in window) {
                recognition = new webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                
                recognition.onstart = function() {
                    isListening = true;
                    voiceBtn.classList.add("listening");
                    searchBox.placeholder = "Listening...";
                };
                
                recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    searchBox.value = transcript;
                    keyword = transcript;
                    page = 1;
                    searchResult.innerHTML = "";
                    searchImages();
                };
                
                recognition.onerror = function(event) {
                    console.error("Voice recognition error", event.error);
                    isListening = false;
                    voiceBtn.classList.remove("listening");
                    searchBox.placeholder = "Search for photos...";
                    showNotification("Voice recognition failed. Please try again.");
                };
                
                recognition.onend = function() {
                    isListening = false;
                    voiceBtn.classList.remove("listening");
                    searchBox.placeholder = "Search for photos...";
                };
            } else {
                voiceBtn.style.display = "none";
                showNotification("Voice search is not supported in your browser");
            }
        }

        voiceBtn.addEventListener("click", () => {
            if (!recognition) {
                initVoiceRecognition();
                return;
            }
            
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        async function searchImages() {
            keyword = searchBox.value.trim();
            hideSuggestions();
            
            if (!keyword) {
                showNotification("Please enter a search term.");
                return;
            }

            loadingIndicator.style.display = "block";
            showMoreBtn.style.display = "none";

            try {
                const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
                
                const data = await response.json();
                loadingIndicator.style.display = "none";
                
                if (page === 1) searchResult.innerHTML = "";
                
                if (data.results?.length > 0) {
                    displayImages(data.results);
                    if (data.total_pages > page) showMoreBtn.style.display = "block";
                } else if (page === 1) {
                    showNotification(`No images found for "${keyword}". Try something else!`);
                }
            } catch (error) {
                console.error("Error fetching images:", error);
                loadingIndicator.style.display = "none";
                showNotification("Something went wrong. Please try again later.");
            }
        }

        function displayImages(images) {
            images.forEach(img => {
                const imageElement = document.createElement("div");
                imageElement.classList.add("image-container");
                imageElement.innerHTML = `
                    <img src="${img.urls.regular}" alt="${img.alt_description || keyword} image" loading="lazy">
                    <div class="image-actions">
                        <button onclick="downloadImage('${img.links.download}?force=true')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="copyLink('${img.links.html}')">
                            <i class="fas fa-link"></i> Copy Link
                        </button>
                    </div>
                `;
                searchResult.appendChild(imageElement);
            });
        }

        function searchCategory(category) {
            searchBox.value = category;
            page = 1;
            searchImages();
            return false;
        }

        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            page = 1;
            searchImages();
        });

        showMoreBtn.addEventListener("click", () => {
            page++;
            searchImages();
        });

        function downloadImage(url) {
            const a = document.createElement("a");
            a.href = url;
            a.download = "unsplash-image.jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function copyLink(url) {
            navigator.clipboard.writeText(url).then(() => {
                showNotification("Image link copied to clipboard!");
            }).catch(err => {
                console.log("Failed to copy:", err);
                showNotification("Failed to copy link. Please try again.");
            });
        }

        function showNotification(message) {
            const bar = document.getElementById("notificationBar");
            const messageEl = document.getElementById("notificationMessage");
            
            messageEl.textContent = message;
            bar.classList.add("visible");
            
            setTimeout(hideNotification, 5000);
        }

        function hideNotification() {
            const bar = document.getElementById("notificationBar");
            bar.classList.remove("visible");
        }

        document.getElementById("closeNotification").addEventListener("click", hideNotification);

        searchBox.addEventListener('input', async (e) => {
            const term = e.target.value;
            if (term.length > 2) {
                try {
                    const response = await fetch(`https://api.unsplash.com/search/photos?query=${term}&per_page=5&client_id=${accessKey}`);
                    const data = await response.json();
                    const suggestions = data.results.map(img => img.alt_description || img.description || "Popular image").filter(Boolean);
                    showSuggestions(suggestions.slice(0, 5));
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                }
            } else {
                hideSuggestions();
            }
        });

        function showSuggestions(suggestions) {
            if (suggestions.length === 0) {
                hideSuggestions();
                return;
            }

            suggestionsDropdown.innerHTML = '';
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.textContent = suggestion.length > 30 ? `${suggestion.substring(0, 30)}...` : suggestion;
                item.addEventListener('click', () => {
                    searchBox.value = suggestion;
                    hideSuggestions();
                    searchImages();
                });
                suggestionsDropdown.appendChild(item);
            });
            suggestionsDropdown.classList.add('visible');
        }

        function hideSuggestions() {
            suggestionsDropdown.classList.remove('visible');
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container') && !e.target.closest('.suggestions-container')) {
                hideSuggestions();
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        toggleViewBtn.addEventListener('click', () => {
            isGridView = !isGridView;
            if (isGridView) {
                searchResult.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                toggleViewBtn.innerHTML = '<i class="fas fa-th"></i>';
            } else {
                searchResult.style.gridTemplateColumns = '1fr';
                toggleViewBtn.innerHTML = '<i class="fas fa-list"></i>';
            }
        });

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });

        initDarkMode();
        initParticles();