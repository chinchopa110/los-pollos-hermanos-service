(function loadAxiosLibrary() {
    'use strict';
    
    if (typeof window.axios !== 'undefined') {
        console.log('Axios already loaded');
        initNewsManager();
        return;
    }
    
    const localScript = document.createElement('script');
    localScript.src = 'js/axios.min.js';
    localScript.async = true;
    
    localScript.onload = function() {
        console.log('Axios loaded from local file');
        initNewsManager();
    };
    
    localScript.onerror = function() {
        console.log('Local axios not found, loading from CDN');
        
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
        cdnScript.async = true;
        
        cdnScript.onload = function() {
            console.log('Axios loaded from CDN');
            initNewsManager();
        };
        
        cdnScript.onerror = function() {
            console.warn('Failed to load axios from CDN, using fetch API');
            window.axios = {
                get: function(url, config) {
                    return new Promise(function(resolve, reject) {
                        const xhr = new XMLHttpRequest();
                        const params = config && config.params ? config.params : {};
                        const timeout = config && config.timeout ? config.timeout : 10000;
                        
                        const query = Object.keys(params)
                            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
                            .join('&');
                        
                        const fullUrl = query ? url + (url.includes('?') ? '&' : '?') + query : url;
                        
                        xhr.open('GET', fullUrl, true);
                        xhr.timeout = timeout;
                        
                        if (config && config.headers) {
                            Object.keys(config.headers).forEach(key => {
                                xhr.setRequestHeader(key, config.headers[key]);
                            });
                        }
                        
                        xhr.onload = function() {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve({
                                    data: JSON.parse(xhr.responseText),
                                    status: xhr.status,
                                    statusText: xhr.statusText,
                                    headers: {
                                        'content-type': xhr.getResponseHeader('content-type')
                                    },
                                    config: config,
                                    request: xhr
                                });
                            } else {
                                const error = new Error(`Request failed with status code ${xhr.status}`);
                                error.response = {
                                    status: xhr.status,
                                    statusText: xhr.statusText,
                                    headers: {
                                        'content-type': xhr.getResponseHeader('content-type')
                                    },
                                    config: config
                                };
                                reject(error);
                            }
                        };
                        
                        xhr.onerror = function() {
                            const error = new Error('Network Error');
                            reject(error);
                        };
                        
                        xhr.ontimeout = function() {
                            const error = new Error(`timeout of ${timeout}ms exceeded`);
                            error.code = 'ECONNABORTED';
                            reject(error);
                        };
                        
                        xhr.send();
                    });
                }
            };
            initNewsManager();
        };
        
        document.head.appendChild(cdnScript);
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.head.appendChild(localScript);
        });
    } else {
        document.head.appendChild(localScript);
    }
})();

function initNewsManager() {
    class NewsManager {
        constructor() {
            this.currentPosts = [];
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.loadNews();
        }
        
        bindEvents() {
            document.getElementById('retryBtn')?.addEventListener('click', () => {
                this.clearNews();
                this.loadNews();
            });
        }
        
        clearNews() {
            const newsGrid = document.getElementById('newsGrid');
            if (newsGrid) {
                newsGrid.innerHTML = '';
            }
            document.getElementById('noNews')?.classList.add('hidden');
        }
        
        showLoader() {
            document.getElementById('loader')?.classList.remove('hidden');
            document.getElementById('newsGrid')?.classList.add('hidden');
            document.getElementById('noNews')?.classList.add('hidden');
            this.hideError();
            this.clearNews();
        }
        
        hideLoader() {
            document.getElementById('loader')?.classList.add('hidden');
        }
        
        showError(message) {
            const errorEl = document.getElementById('error');
            const errorMsg = document.getElementById('errorMessage');
            
            if (errorEl && errorMsg) {
                errorMsg.textContent = message;
                errorEl.classList.remove('hidden');
            }
            
            document.getElementById('newsGrid')?.classList.add('hidden');
            document.getElementById('noNews')?.classList.add('hidden');
            this.hideLoader();
        }
        
        hideError() {
            document.getElementById('error')?.classList.add('hidden');
        }
        
        async loadNews() {
            this.showLoader();
            
            try {
                const randomUserId = Math.floor(Math.random() * 10) + 1;
                const randomLimit = Math.floor(Math.random() * 10) + 5;
                
                const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
                    params: {
                        userId: randomUserId,
                        _limit: randomLimit
                    },
                    timeout: 10000,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                const posts = response.data;
                
                if (posts.length === 0) {
                    this.showNoNews();
                } else {
                    this.displayNews(posts);
                    this.hideLoader();
                    this.hideError();
                }
                
            } catch (error) {
                this.handleError(error);
            }
        }
        
        showNoNews() {
            document.getElementById('noNews')?.classList.remove('hidden');
            document.getElementById('newsGrid')?.classList.add('hidden');
            this.hideLoader();
            this.hideError();
        }
        
        displayNews(posts) {
            this.currentPosts = posts;
            const newsGrid = document.getElementById('newsGrid');
            
            if (!newsGrid) return;
            
            newsGrid.innerHTML = '';
            
            posts.forEach(post => {
                const newsElement = this.createNewsElement(post);
                newsGrid.appendChild(newsElement);
            });
            
            newsGrid.classList.remove('hidden');
            this.hideError();
        }
        
        createNewsElement(post) {
            const template = document.getElementById('newsTemplate');
            const clone = template.content.cloneNode(true);
            
            const titleEl = clone.querySelector('.news-title');
            const categoryEl = clone.querySelector('.news-category');
            const bodyEl = clone.querySelector('.news-body');
            
            if (titleEl) titleEl.textContent = post.title;
            if (categoryEl) {
                const categories = ['Акции', 'Новинки', 'События', 'Обновления'];
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                categoryEl.textContent = randomCategory;
            }
            if (bodyEl) bodyEl.textContent = post.body;
            
            return clone;
        }
        
        handleError(error) {
            console.error('News error:', error);
            
            let message = 'Не удалось загрузить новости';
            
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                message = 'Время ожидания запроса истекло';
            } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
                message = 'Нет подключения к интернету. Проверьте сеть';
            } else if (error.response?.status === 404) {
                message = 'Сервер не найден';
            } else if (error.response?.status >= 500) {
                message = 'Временные проблемы на сервере. Попробуйте позже';
            } else if (error.response?.status) {
                message = `Ошибка сервера: ${error.response.status}`;
            } else if (error.message) {
                message = `Ошибка: ${error.message}`;
            }
            
            this.clearNews();
            document.getElementById('newsGrid')?.classList.add('hidden');
            document.getElementById('noNews')?.classList.add('hidden');
            
            this.showError(message);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.newsManager = new NewsManager();
        });
    } else {
        window.newsManager = new NewsManager();
    }
}