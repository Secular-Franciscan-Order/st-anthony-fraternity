export const siteContent = {
  identity: {
    name: 'Saint Anthony Fraternity',
    order: 'Secular Franciscan Order',
    abbreviation: 'OFS',
    location: 'Tucson, Arizona',
  },
  introduction:
    'We are Catholics who seek to follow Jesus Christ in the footsteps of Saint Francis and Saint Clare—while remaining fully present in family life, work, parish, and community.',
  welcome:
    'You do not need to know whether the Secular Franciscan vocation is for you. You only need enough curiosity to come, meet us, and listen.',
  gathering: {
    frequency: 'Second Sunday of each month',
    time: '1:30–4:00 p.m.',
    room: 'Saint Clare Room',
    venue: 'San Xavier del Bac Mission Parish',
    address: '1950 W San Xavier Rd, Tucson, AZ 85746',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=1950%20W%20San%20Xavier%20Rd%2C%20Tucson%2C%20AZ%2085746',
  },
  contact: {
    name: 'Benjamin Saenz, OFS',
    role: 'Fraternity Minister',
    phone: '(520) 366-7466',
    phoneHref: 'tel:+15203667466',
    email: 'benjamin.saenz@gmail.com',
    emailHref: 'mailto:benjamin.saenz@gmail.com',
  },
  waysOfLife: [
    {
      title: 'Prayer',
      text: 'We make room for God in the ordinary rhythm of each day and let prayer shape how we see the world.',
    },
    {
      title: 'Fraternity',
      text: 'We learn beside brothers and sisters who encourage one another, listen well, and grow together.',
    },
    {
      title: 'Simplicity',
      text: 'We practice gratitude, humility, and freedom from the things that can crowd out what matters most.',
    },
    {
      title: 'Service & creation',
      text: 'We carry the Gospel into our relationships and communities, with special care for people in need and our common home.',
    },
  ],
  formation: [
    {
      name: 'Orientation',
      timing: 'About 3–6 months',
      text: 'Visit the fraternity, ask questions, and begin to explore Franciscan spirituality and vocation.',
    },
    {
      name: 'Inquiry',
      timing: 'About 6 months',
      text: 'Learn more about the Franciscan family, the Church, and the shape of Secular Franciscan life.',
    },
    {
      name: 'Candidacy',
      timing: 'Generally 18 months–3 years',
      text: 'Deepen prayer, study the Rule, and discern a lasting commitment with the formation team.',
    },
    {
      name: 'Profession',
      timing: 'A lifelong commitment',
      text: 'Make a public promise to live the Gospel according to the Rule of the Secular Franciscan Order.',
    },
  ],
  formationNote:
    'Formation unfolds gradually. These timeframes are approximate; the local formation team will confirm the process with each person.',
  questions: [
    {
      question: 'Who are Secular Franciscans?',
      answer:
        'They are Catholic laypeople and diocesan clergy who live in the world and follow the Gospel in the spirit of Saint Francis. Members come from many walks of life and may be single or married.',
    },
    {
      question: 'Would I have to leave my family, parish, or career?',
      answer:
        'No. Secular Franciscan life is lived within everyday responsibilities. Home, work, parish, and neighborhood become the places where the vocation takes shape.',
    },
    {
      question: 'Is visiting a commitment?',
      answer:
        'Not at all. A first visit is simply a chance to meet the fraternity, experience the gathering, and ask honest questions.',
    },
    {
      question: 'What happens during formation?',
      answer:
        'Formation combines prayer, conversation, study, and discernment. It moves through orientation, inquiry, and candidacy before a person decides whether to make profession.',
    },
    {
      question: 'What does profession mean?',
      answer:
        'Profession is a public, lifelong promise to live the Gospel according to the Rule of the Secular Franciscan Order. It follows a substantial period of formation and free discernment.',
    },
  ],
  quote: {
    text: 'Praised be You, my Lord, with all Your creatures.',
    attribution: 'Saint Francis of Assisi, The Canticle of the Creatures',
  },
  links: {
    region: 'https://www.stmregionofs.com/',
    national: 'https://www.secularfranciscansusa.org/',
    formation:
      'https://www.secularfranciscansusa.org/initial-formation-resources/',
  },
} as const;
