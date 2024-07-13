document.addEventListener("DOMContentLoaded", () => {
    const url = 'https://interview.switcheo.com/prices.json';

    async function fetchData() {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response failed ' + response.statusText);
            }
            const data = await response.json();
            updateTokenOptions(data);
            updatePriceInfo(data);
            addInputEventListeners(data);
            addSwapButtonEventListener(data);
        } catch (error) {
            console.error('A problem occured when fetching the data:', error);
        }
    }

    function updateTokenOptions(data) {
        const sellTokenDropdown = document.getElementById("sellTokenDropdown");
        const buyTokenDropdown = document.getElementById("buyTokenDropdown");
        const sellTokenButton = document.getElementById("sellTokenButton");
        const buyTokenButton = document.getElementById("buyTokenButton");

        sellTokenDropdown.innerHTML = '';
        buyTokenDropdown.innerHTML = '';

        // dropdown options
        data.forEach(item => {
            const sellOption = document.createElement("div");
            sellOption.innerHTML = `<img src="tokens/${item.currency}.svg" alt="${item.currency} icon">${item.currency}`;
            sellOption.addEventListener("click", () => {
                sellTokenButton.innerHTML = sellOption.innerHTML;
                sellTokenButton.dataset.value = item.currency;
                updatePriceInfo(data);
            });
            sellTokenDropdown.appendChild(sellOption);

            const buyOption = document.createElement("div");
            buyOption.innerHTML = `<img src="tokens/${item.currency}.svg" alt="${item.currency} icon">${item.currency}`;
            buyOption.addEventListener("click", () => {
                buyTokenButton.innerHTML = buyOption.innerHTML;
                buyTokenButton.dataset.value = item.currency;
                updatePriceInfo(data);
            });
            buyTokenDropdown.appendChild(buyOption);
        });

        // default token option
        sellTokenButton.innerHTML = `<img src="tokens/USD.svg" alt="USD icon">USD`; 
        sellTokenButton.dataset.value = 'USD';
        buyTokenButton.innerHTML = `<img src="tokens/BLUR.svg" alt="BLUR icon">BLUR`; 
        buyTokenButton.dataset.value = 'BLUR';
        
        sellTokenButton.addEventListener("click", () => toggleDropdown(sellTokenDropdown));
        buyTokenButton.addEventListener("click", () => toggleDropdown(buyTokenDropdown));
        window.addEventListener("click", (e) => {
            if (!e.target.matches('.dropdown-button')) {
                closeAllDropdowns();
            }
        });
    }

    function toggleDropdown(dropdown) {
        closeAllDropdowns();
        dropdown.classList.toggle("show");
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }


    function addInputEventListeners(data) {
        const sellAmountInput = document.getElementById("sellAmount");
        const buyAmountInput = document.getElementById("buyAmount");

        sellAmountInput.addEventListener("input", () => updateBuyAmount(data));
        buyAmountInput.addEventListener("input", () => updateSellAmount(data));

        // only numbers
        sellAmountInput.addEventListener("keydown", validateInput);
        buyAmountInput.addEventListener("keydown", validateInput);
        sellAmountInput.addEventListener("input", removeInvalidChars);
        buyAmountInput.addEventListener("input", removeInvalidChars);
    }

    function validateInput(event) {
        const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
        if (!/[0-9.]/.test(event.key) && !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    function removeInvalidChars(event) {
        event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    }

    function updateBuyAmount(data) {
        const sellAmountInput = document.getElementById("sellAmount");
        const buyAmountInput = document.getElementById("buyAmount");
        const sellTokenButton = document.getElementById("sellTokenButton");
        const buyTokenButton = document.getElementById("buyTokenButton");

        const sellAmount = parseFloat(sellAmountInput.value);
        const sellToken = sellTokenButton.dataset.value;
        const buyToken = buyTokenButton.dataset.value;

        const sellTokenData = data.find(item => item.currency === sellToken);
        const buyTokenData = data.find(item => item.currency === buyToken);

        if (sellTokenData && buyTokenData && !isNaN(sellAmount)) {
            const exchangeRate = sellTokenData.price / buyTokenData.price;
            const buyAmount = (sellAmount * exchangeRate).toFixed(2);
            buyAmountInput.value = buyAmount;
        } else {
            buyAmountInput.value = '';
        }
    }

    function updateSellAmount(data) {
        const sellAmountInput = document.getElementById("sellAmount");
        const buyAmountInput = document.getElementById("buyAmount");
        const sellTokenButton = document.getElementById("sellTokenButton");
        const buyTokenButton = document.getElementById("buyTokenButton");

        const buyAmount = parseFloat(buyAmountInput.value);
        const sellToken = sellTokenButton.dataset.value;
        const buyToken = buyTokenButton.dataset.value;

        const sellTokenData = data.find(item => item.currency === sellToken);
        const buyTokenData = data.find(item => item.currency === buyToken);

        if (sellTokenData && buyTokenData && !isNaN(buyAmount)) {
            const exchangeRate = buyTokenData.price / sellTokenData.price;
            const sellAmount = (buyAmount * exchangeRate).toFixed(2);
            sellAmountInput.value = sellAmount;
        } else {
            sellAmountInput.value = '';
        }
    }

    function updatePriceInfo(data) {
        const sellTokenButton = document.getElementById("sellTokenButton");
        const buyTokenButton = document.getElementById("buyTokenButton");
        const priceInfo = document.getElementById("priceInfo");

        if (!priceInfo) {
            console.error("priceInfo element not found in the DOM");
            return;
        }

        const sellToken = sellTokenButton.dataset.value;
        const buyToken = buyTokenButton.dataset.value;
        const sellTokenData = data.find(item => item.currency === sellToken);
        const buyTokenData = data.find(item => item.currency === buyToken);

        if (sellTokenData && buyTokenData) {
            const exchangeRate = (sellTokenData.price / buyTokenData.price).toFixed(2);
            priceInfo.innerHTML = `1 ${buyToken} = ${exchangeRate} ${sellToken} <span class="price-change">($${sellTokenData.price})</span>`;
        }
    }

    // ----------- Swap Button ------------
    function addSwapButtonEventListener(data) {
        const swapButton = document.getElementById("swapButton");
        swapButton.addEventListener("click", () => swapInputs(data));
    }

    function swapInputs(data) {
        const sellAmountInput = document.getElementById("sellAmount");
        const buyAmountInput = document.getElementById("buyAmount");
        const sellTokenButton = document.getElementById("sellTokenButton");
        const buyTokenButton = document.getElementById("buyTokenButton");

        // swap the values of the input fields
        const sellAmount = sellAmountInput.value;
        sellAmountInput.value = buyAmountInput.value;
        buyAmountInput.value = sellAmount;

        // swap the values of the selected tokens
        const sellToken = sellTokenButton.dataset.value;
        sellTokenButton.dataset.value = buyTokenButton.dataset.value;
        buyTokenButton.dataset.value = sellToken;

        // to reflect the change
        const sellTokenInnerHTML = sellTokenButton.innerHTML;
        sellTokenButton.innerHTML = buyTokenButton.innerHTML;
        buyTokenButton.innerHTML = sellTokenInnerHTML;

        updatePriceInfo(data);
    }

    function showSidePanel() {
        document.getElementById("sidePanel").style.width = "300px";
    }

    function closeSidePanel() {
        document.getElementById("sidePanel").style.width = "0";
    }

    document.getElementById("connectWalletButton").addEventListener("click", showSidePanel);
    document.getElementById("closePanelButton").addEventListener("click", closeSidePanel);
    
    fetchData();
});
