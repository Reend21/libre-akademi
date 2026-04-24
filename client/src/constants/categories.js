export const CATEGORY_STRUCTURE = [
  {
    name: 'Linux',
    icon: 'bi bi-ubuntu',
    subcategories: [
      { name: 'Genel Linux', icon: 'bi bi-terminal' },
      { name: 'Ubuntu Tabanlı Linux Dağıtımları', icon: 'bi bi-ubuntu' },
      { name: 'Debian Tabanlı Linux Dağıtımları', icon: 'bi bi-device-hdd' },
      { name: 'Arch Linux Tabanlı Linux Dağıtımları', icon: 'bi bi-cpu' },
      { name: 'OpenSUSE Tabanlı Linux dağıtımları', icon: 'bi bi-bug' },
      { name: 'Fedora Tabanlı Linux Dağıtımları', icon: 'bi bi-infinity' },
      { name: 'RHEL Tabanlı Linux Dağıtımları', icon: 'bi bi-shield-shaded' },
      { name: 'Diğer Linux Dağıtımları', icon: 'bi bi-box' }
    ]
  },
  {
    name: 'Office Programları',
    icon: 'bi bi-file-earmark-bar-graph',
    subcategories: [
      { name: 'Microsoft Office > Excel', icon: 'bi bi-file-earmark-excel' },
      { name: 'Microsoft Office > Word', icon: 'bi bi-file-earmark-word' },
      { name: 'Microsoft Office > Powerpoint', icon: 'bi bi-file-earmark-ppt' },
      { name: 'Microsoft Office > Access', icon: 'bi bi-database' },
      { name: 'LibreOffice Programları', icon: 'bi bi-file-earmark-text' },
      { name: 'ONLYOFFICE', icon: 'bi bi-building' },
      { name: 'Diğer Ofis programları', icon: 'bi bi-three-dots' }
    ]
  },
  {
    name: 'Video Düzenleme',
    icon: 'bi bi-camera-reels-fill',
    subcategories: [
      { name: 'Capcut', icon: 'bi bi-scissors' },
      { name: 'Davinci Resolve', icon: 'bi bi-palette' },
      { name: 'Premiere Pro', icon: 'bi bi-film' },
      { name: 'Sony Vegas', icon: 'bi bi-collection-play' },
      { name: 'After Effects', icon: 'bi bi-magic' }
    ]
  },
  {
    name: 'Programlama',
    icon: 'bi bi-code-slash',
    subcategories: [
      { name: 'JavaScript', icon: 'bi bi-braces' },
      { name: 'HTML', icon: 'bi bi-code' },
      { name: 'CSS', icon: 'bi bi-brush' },
      { name: 'Python', icon: 'bi bi-hash' },
      { name: 'Perl', icon: 'bi bi-hypnotize' },
      { name: 'Rust', icon: 'bi bi-nut' },
      { name: 'C', icon: 'bi bi-c-circle' },
      { name: 'C++', icon: 'bi bi-plus-circle' },
      { name: 'C#', icon: 'bi bi-hash' },
      { name: 'Java', icon: 'bi bi-cup-hot' },
      { name: 'Ruby', icon: 'bi bi-gem' }
    ]
  },
  {
    name: 'Yapay Zeka',
    icon: 'bi bi-robot',
    subcategories: [
      { name: 'Yapay Zeka Temelleri', icon: 'bi bi-cpu' },
      { name: 'Makine Öğrenmesi', icon: 'bi bi-diagram-3' },
      { name: 'Derin Öğrenme', icon: 'bi bi-layers' },
      { name: 'Doğal Dil İşleme', icon: 'bi bi-chat-text' },
      { name: 'Görüntü İşleme', icon: 'bi bi-image' },
      { name: 'Generative AI', icon: 'bi bi-stars' }
    ]
  }
];

export const POPULAR_CATEGORIES = [
  { name: 'Python', color: '#3776AB' },
  { name: 'Arch Linux', color: '#1793D1' },
  { name: 'JavaScript', color: '#F7DF1E' } // Removed black or dark themes
];
