const API = "https://api.chucknorris.io/jokes";

const controller = (action) => fetch(action).then(response => response.json());

const categoryDiv = document.querySelector('#category');

controller(`${API}/categories`)
  .then(data => {
    data.forEach(category => {
      const label = document.createElement('label');
      const input = document.createElement('input');

      input.type = 'radio';
      input.name = 'jokeCategory';
      input.value = category;

      label.innerText = category;
      label.prepend(input);
      categoryDiv.append(label);
    })
  });

const formData = document.querySelector('.form');
const cardContainer = document.querySelector('.card-container');
const favContainer = document.querySelector('.fav-container');

const obj = {
  random: () => controller(`${API}/random`),
  category: (choosenCategory) => controller(`${API}/random?category=${choosenCategory.toLowerCase()}`),
  search: (searchValue) => controller(`${API}/search?query=${searchValue.toLowerCase()}`),
};

formData.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.querySelector('input[name=jokeType]:checked').value;

  const choosenCategory = document.querySelector('input[name=jokeCategory]:checked')?.value;
  let searchValue = document.querySelector('#searchText')?.value;

  obj[type](searchValue || choosenCategory || '')
    .then(data => {
      const jokes = data?.total ? data.result : [data];

      jokes.forEach((joke) => {
        const cardJoke = createCard(joke);
        addJokeCardIntoContainer(cardContainer, cardJoke);
      });
    })
    .then(() => {
      formData.reset();
    });
});

function createCard(joke) {
  const card = document.createElement('div');
  const cardId = document.createElement('p');
  const cardText = document.createElement('p');
  const like = document.createElement('span');
  const category = document.createElement('div');

  cardId.innerText = `ID: ${joke.id}`;
  cardText.innerText = joke.value;
  like.innerText = isJokeInFavList(joke) ? '💜' : '🤍';
  category.innerText = joke.categories[0] || '';

  like.addEventListener('click', () => {
    isJokeInFavList(joke) ? removeFavOnclick(joke) : renderFavOnclick(joke);
    like.innerText = isJokeInFavList(joke) ? '💜' : '🤍';
  });

  card.classList.add('card');
  cardId.classList.add('id');
  cardText.classList.add('card-text');
  like.classList.add('like');
  category.classList.add('category');
  card.id = joke.id;

  card.append(cardId, cardText, like);

  if (joke.categories[0]) card.append(category);
  return card;
}

function addJokeCardIntoContainer(container, card) {
  container.prepend(card);
}

function getPrevJokesFromLocalStorage() {
  return localStorage.getItem('favJokes') ? JSON.parse(localStorage.getItem('favJokes')) : [];
}

function addJokeToLocalStorage(joke) {
  const updatedJokes = [...getPrevJokesFromLocalStorage(), joke];
  localStorage.setItem('favJokes', JSON.stringify(updatedJokes));
}

function renderFavOnclick(joke) {
  addJokeToLocalStorage(joke);

  const cardJoke = createCard(joke);
  addJokeCardIntoContainer(favContainer, cardJoke);
}

function removeFavOnclick(joke) {
  const jokeInList = document.querySelector(`#${joke.id}`);
  jokeInList.querySelector('span').innerText = '🤍';
  removeJokeFromLocalStorage(joke);
}

function removeJokeFromLocalStorage(joke) {
  const prevJokes = getPrevJokesFromLocalStorage();
  const filteredJoke = prevJokes.filter((prevJoke) => prevJoke.id !== joke.id);

  localStorage.setItem('favJokes', JSON.stringify(filteredJoke));

  favContainer.innerHTML = '';
  renderJokesToFav();
}

function renderJokesToFav() {
  const prevJokes = getPrevJokesFromLocalStorage();

  prevJokes.forEach((joke) => {
    const cardJoke = createCard(joke);
    addJokeCardIntoContainer(favContainer, cardJoke);
  });
}

function isJokeInFavList(joke) {
  const currentJokes = getPrevJokesFromLocalStorage();

  return !!currentJokes.find((jokeLocalStorage) => jokeLocalStorage.id === joke.id)?.id;
}

renderJokesToFav();