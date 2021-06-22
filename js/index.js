"use strict";

const addressInput = document.querySelector(".ip__form-input");
const ipAddressForm = document.querySelector(".ip__form");

class App {
  #map;
  _parentElement = document.querySelector(".ip__preview");
  _errMessage = "Sorry, This ip is wrong ! Please enter a valid ip address";
  _API_URL = `https://geo.ipify.org/api/v1?apiKey=at_2SMAYSkW8PSMQjvRBybnYYunlULOc`;

  constructor() {
    window.addEventListener("load", this.fetchData.bind(this));
    ipAddressForm.addEventListener("submit", this.fetchData.bind(this));
  }

  getCoordsAndRenderMap() {
    if (navigator.geolocation) {
      return (
        navigator.geolocation.getCurrentPosition((position) => {
          this.loadMap(position.coords);
        }),
        (error) => console.error(error.message)
      );
    }
  }

  loadMap(coords = {}) {
    this.#map && this.#map.remove();

    this.#map = L.map("map").setView([coords.latitude, coords.longitude], 13);

    //prettier-ignore
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png").addTo(this.#map);

    L.marker([coords.latitude, coords.longitude]).addTo(this.#map).openPopup();
  }

  async fetchData(e) {
    try {
      e.preventDefault();

      const query = this.getQuery();

      this.renderSpinner();

      this._cleanInput();

      const data = await this._getJSON(query);

      const { lng, lat } = data.location;

      const coords = { latitude: lat, longitude: lng };

      this.loadMap(coords);

      this.displayIPData(data);
    } catch (err) {
      console.error(err);
      this.renderError();
    }
  }

  getQuery() {
    const query = addressInput.value;
    if (query !== "") return query;
  }

  async _getJSON(query) {
    try {
      const url = query
        ? `${this._API_URL}&ipAddress=${query}`
        : `${this._API_URL}`;

      const ip = await fetch(url);

      return await ip.json();
    } catch (err) {
      console.error(err);
      this.renderError();
    }
  }

  displayIPData(data) {
    const markup = `<li class="ip__preview-item">
      <div class="ip__preview-item--label">IP Address</div>
      <div class="ip__preview-item--value">${data.ip}</div>
    </li>
    <li class="ip__preview-item">
      <div class="ip__preview-item--label">Location</div>
      <div class="ip__preview-item--value">${data.location.region}, ${data.location.country} ${data.location.postalCode}</div>
    </li>
    <li class="ip__preview-item">
      <div class="ip__preview-item--label">Timezone</div>
      <div class="ip__preview-item--value">UTC ${data.location.timezone}</div>
    </li>
    <li class="ip__preview-item">
      <div class="ip__preview-item--label">ISP</div>
      <div class="ip__preview-item--value">${data.isp}</div>
    </li>`;

    this._clearParentElement();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(errMsg = this._errMessage) {
    const markup = `
    <div class="error grid-item-center">
      <p class="error__message">
        ${errMsg}
      </p>
    </div>`;
    this._clearParentElement();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderSpinner() {
    const markup = `
    <div class="spinner grid-item-center">
      <img src="images/icon-loading.svg" class='spinner__img'/>
    </div>`;
    this._clearParentElement();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _clearParentElement() {
    this._parentElement.innerHTML = "";
  }
  _cleanInput() {
    addressInput.value = "";
  }
}

const app = new App();
