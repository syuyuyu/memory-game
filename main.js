// 遊戲state
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatchFailed: "CardMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished"
}

// 符號資料
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// 畫面管理
const view = {
  // 轉換特殊文字
  transformNumber(number) {
    switch (number) {
      case 1: return 'A'
      case 11: return 'J'
      case 12: return 'Q'
      case 13: return 'K'
      default: return number
    }
  },

  // 產生 .card div
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },

  // 產生 .card 內容
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" >
      <p>${number}</p>
    `
  },

  // 輸出cards
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join(' ')
  },

  // 翻牌函式
  flipCards(...cards) {
    cards.map((card) => {
      // 如果是背面 > 回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        // 呼叫卡片內容函式
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 如果是正面 > 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  // 更改背景色
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },

  // 遊戲分數
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  // 遊戲回合
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  //增加錯誤時的動畫
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong')
      card.addEventListener('animationend', (e) => {
        e.target.classList.remove('wrong'), { once: true }
      })
    })
  },

  //completed
  showGameFinished() {
    document.querySelector('.end').innerHTML = `
        <div class="completed">
        <h1>Congrats!!!</h1>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
    `
  }

}

// 外部運算工具
const utility = {
  // 取得隨機Number
  getRandomNumberArray(count) {
    let number = Array.from(Array(52).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  },
}


// 資料管理
const model = {
  // 被翻開的兩張牌卡資料
  revealedCards: [],

  // 判斷牌卡數字是否相同
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}


// 控制流程
const controller = {
  // 定義當下state
  currentState: GAME_STATE.FirstCardAwaits,

  // 開局發牌
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 總控中心
  dispatchCardAction(card) {
    // 若是正面就不理
    if (!card.classList.contains('back')) {
      return
    }
    // 判斷遊戲state，控制遊戲流程
    switch (this.currentState) {
      // 等待第一張翻牌
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      // 等待第二張翻牌
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          // 增加背景色
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },

  // 牌卡reset
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  // console.log('revealCard : ', model.revealedCards)
  // console.log('game state : ', this.currentState)
}





controller.generateCards()


document.querySelectorAll('.card')
  .forEach(
    (card) => {
      card.addEventListener('click',
        function onClickedCard(event) {
          controller.dispatchCardAction(card)
        })
    })