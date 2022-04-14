import apiKey from '../apikey.js';

const CHAR_CODE = 65,
  API_KEY = apiKey,
  API_VERSION = '1.5.0',
  DETAILS = Array.from(document.querySelectorAll('details'));
// // when the user chooses a category from the list, it populates the sub-category list.
// // when the user chooses a name from the sub-category list, it generates a villager passport

document.addEventListener('DOMContentLoaded', appInit);

// close details that are not the last one clicked.
DETAILS.forEach(d => {
  d.addEventListener('click', e => {
    DETAILS.forEach(detail => {
      if (detail !== d) detail.removeAttribute('open');
    })
  });
});

async function appInit() {
  let app = new App();
  await app.init();
  console.log(app);
  document.querySelector('.search-bar').addEventListener('input', e => {
    app.searchBarFilter(e.currentTarget.value);
  });
}

// //villagers class to house all app data and methods
class App {
  constructor() {
    this.baseUrl = "https://api.nookipedia.com/villagers?game=nh&nhdetails=true";
    this.fetchHeaders = {
      headers: {
        'X-API-KEY': API_KEY,
        'Accept-Version': API_VERSION
      }
    };
    this.personalities = [];
    this.alphabet = [];
    this.species = [];
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.signs = [];
    this.villagers = [];
    
    // too lazy to make an alphabet array by hand
    for (let i = CHAR_CODE; i < CHAR_CODE + 26; i++) {
      this.alphabet.push(String.fromCharCode(i));
    }
  }

  async init() {
    await this.setLists();
    ['alphabet', 'species', 'personalities', 'months', 'signs'].forEach(list => {
      this.renderListLinks(this[list], `#${list}-list`);
    });
  }

  async setLists() {
    try {
      const res = await fetch(this.baseUrl, this.fetchHeaders);
      const data = await res.json();
      this.villagers = this.villagers.concat(data);

      this.setList(this.species, 'species');
      this.setList(this.personalities, 'personality');
      this.setList(this.signs, 'sign');

    } catch (error) {
      console.error(error);
      alert(error);
    }

  }

  setList(vArr, str) {
    if (vArr.length === 0) {
      this.villagers.map(v => v[str])
        .filter((s, i, arr) => {
          if (i === arr.indexOf(s)) return s;
        })
        .forEach(s => vArr.push(s));
    }
    vArr.sort();
  }

  // 
  renderListLinks(arr, parentId) {
    let parentUl = document.querySelector(`${parentId}`)
    let res = '';
    for (let i = 0; i < arr.length; i++) {
      res += this.createListItem(arr[i]);
    }
    parentUl.innerHTML = res;
    this.addLinkEventListeners(parentId);
  }

  addLinkEventListeners(parentId) {
    let links = Array.from(document.querySelectorAll(`${parentId} a`));
    links.forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        this.advanceSelection(e.currentTarget);
      })
    });
  }

  advanceSelection(e) {
    console.log(e.innerText);
    let names = this.getFilteredNames(e.innerText);
    let res = '';
    if (names.length > 1) {
      const namesParent = document.querySelector('#filtered-names');
      names.forEach(villager => {
        res += this.createListItem(villager.name);
      });
      namesParent.innerHTML = res; 
      this.addLinkEventListeners(`#filtered-names`);
    } else {
      const villager = names[0];
      this.renderPassportDiv(villager);
    }
  }

  getFilteredNames(s) {
    let res;
    if (this.species.includes(s)) {
      res = this.villagersFilter('species', s);
    } else if (this.personalities.includes(s)) {
      res = this.villagersFilter('personality', s);
    } else if (this.months.includes(s)) {
      res = this.villagersFilter('birthday_month', s);
    } else if (this.signs.includes(s)) {
      res = this.villagersFilter('sign', s);
    } else {
      res = this.villagersFilter('name', s);
    }
    return res;
  }

  searchBarFilter(s) {
    let str = s.toLowerCase();
    const parent = document.querySelector(`#filtered-names`).innerHTML = '';
    if (str === "") console.log(parent);
    else {
      let searchBarVillagers = this.villagers.filter(v => {
        let villagerName = v.name.toLowerCase();
        if (villagerName.includes(str)) return v;
      }).map(v => v.name);
      this.renderListLinks(searchBarVillagers, `#filtered-names`);
    }
  }

  villagersFilter(prop, val) {
    let villagers = this.villagers;
    switch (prop) {
      case 'name':
        if (val.length === 1) {
          return villagers.filter(villager => {
            return villager.name[0] === val;
          });
        } else {
          return villagers.filter(villager => {
            return villager.name === val;
          });
        }
      case 'birthday-string':
        return villagers.filter(villager => {
          return villager["birthday_month"] === val;
        });
      default:
        return villagers.filter(villager => {
          return villager[prop] === val;
        });
    }
  }

  renderPassportDiv(villager) {
    const passportParent = document.querySelector('#villager-passport');
    passportParent.querySelector('#villager-name').innerText = villager.name;
    passportParent.querySelector('#villager-photo').src = villager["image_url"];
    passportParent.querySelector('#villager-birthdate').innerText = `${villager["birthday_month"]} ${villager["birthday_day"]}`;
    passportParent.querySelector('#villager-personality').innerText = villager.personality;
    passportParent.querySelector('#villager-quote').innerText = villager.quote;
    passportParent.classList.remove('hidden');
  }

  createListItem(val) {
    return `<li><a href="#">${val}</a></li>`;
  }

}