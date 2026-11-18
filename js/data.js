/* Демо-данные для верстки. На следующем этапе заменяются запросами к API. */
window.MOCK = {
  me: { id: 1, first_name: "Дарья", last_name: "В.", color: "#2a3d72" },

  games: [
    {
      id: "g_NY2027",
      title: "Новый год в ПТО",
      cover: "navy",
      budget: 3000,
      currency: "₽",
      drawDate: "2026-12-15",
      exchangeDate: "2026-12-27",
      format: "offline",
      rules: "Обмен подарками на корпоративе 26 декабря. Подарок — в пределах бюджета, упаковка обязательна.",
      isOwner: true,
      status: "registration", // registration | drawn | finished
      anonChat: true,
      participants: [
        { id: 1, name: "Дарья В.", color: "#2a3d72", wishlist: true },
        { id: 2, name: "Алексей К.", color: "#b3261e", wishlist: true },
        { id: 3, name: "Марина С.", color: "#8a6d2b", wishlist: false },
        { id: 4, name: "Игорь П.", color: "#3b5b8f", wishlist: true },
        { id: 5, name: "Ольга Н.", color: "#6b4e7a", wishlist: true },
        { id: 6, name: "Сергей Д.", color: "#4a6b6f", wishlist: false }
      ],
      exclusions: [[2, 3]]
    },
    {
      id: "g_FAM",
      title: "Семейный Санта",
      cover: "red",
      budget: 5000,
      currency: "₽",
      drawDate: "2026-12-01",
      exchangeDate: "2026-12-31",
      format: "delivery",
      rules: "Дарим по вишлисту, сюрприз приветствуется.",
      isOwner: false,
      status: "drawn",
      anonChat: true,
      giftStatus: 1, // 0 — не куплен, 1 — куплен, 2 — отправлен, 3 — получен
      recipient: {
        id: 7, name: "Катя", color: "#b3261e",
        wishes: [
          { text: "Набор для каллиграфии", link: "https://ozon.ru" },
          { text: "Тёплые носки с оленями" },
          { text: "Книга «Мастер и Маргарита» в красивом издании" }
        ],
        notWanted: "Сладкое — аллергия на орехи",
        hints: "Размер одежды S, любит зелёный цвет"
      },
      participants: [
        { id: 1, name: "Дарья В.", color: "#2a3d72", wishlist: true },
        { id: 7, name: "Катя", color: "#b3261e", wishlist: true },
        { id: 8, name: "Папа", color: "#3b5b8f", wishlist: true },
        { id: 9, name: "Мама", color: "#8a6d2b", wishlist: true }
      ],
      exclusions: []
    }
  ],

  invite: {
    id: "g_DRUZ",
    title: "Новый год на объекте",
    cover: "champ",
    owner: "Никита Р., прораб",
    budget: 2000,
    currency: "₽",
    drawDate: "2026-12-10",
    exchangeDate: "2026-12-25",
    count: 8
  },

  myWishlist: {
    wishes: [
      { text: "Кашемировый шарф, нейтральный цвет" },
      { text: "Сертификат в книжный", link: "https://www.chitai-gorod.ru" }
    ],
    notWanted: "Свечи и статуэтки",
    hints: "Люблю кофе и настольные игры"
  },

  chat: [
    { from: "santa", text: "Привет! Какой цвет тебе ближе — зелёный или синий?", time: "12:04" },
    { from: "them", text: "Зелёный, однозначно", time: "12:30" },
    { from: "santa", text: "Отлично, записал!", time: "12:31" }
  ]
};
