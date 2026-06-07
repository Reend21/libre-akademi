export const CATEGORY_STRUCTURE = [
  {
    name: 'Linux',
    icon: 'si-linux',
    color: '#FCC624',
    subcategories: [
      { name: 'Genel Linux', icon: 'bi bi-terminal', color: '#FCC624' },
      { name: 'Ubuntu Tabanlı Linux Dağıtımları', icon: 'si-ubuntu', color: '#E95420' },
      { name: 'Debian Tabanlı Linux Dağıtımları', icon: 'si-debian', color: '#A80030' },
      { name: 'Arch Linux Tabanlı Linux Dağıtımları', icon: 'si-archlinux', color: '#1793D1' },
      { name: 'OpenSUSE Tabanlı Linux dağıtımları', icon: 'bi bi-bug', color: '#73BA25' },
      { name: 'Fedora Tabanlı Linux Dağıtımları', icon: 'si-fedora', color: '#51A2DA' },
      { name: 'RHEL Tabanlı Linux Dağıtımları', icon: 'si-redhat', color: '#CC0000' },
      { name: 'Diğer Linux Dağıtımları', icon: 'bi bi-box', color: '#FCC624' }
    ]
  },
  {
    name: 'Office Programları',
    icon: 'bi bi-file-earmark-bar-graph',
    color: '#D83B01',
    subcategories: [
      { name: 'Microsoft Office > Excel', icon: 'bi bi-file-earmark-excel', color: '#217346' },
      { name: 'Microsoft Office > Word', icon: 'bi bi-file-earmark-word', color: '#2B579A' },
      { name: 'Microsoft Office > Powerpoint', icon: 'bi bi-file-earmark-ppt', color: '#D83B01' },
      { name: 'Microsoft Office > Access', icon: 'bi bi-database', color: '#A4373A' },
      { name: 'LibreOffice Programları', icon: 'si-libreoffice', color: '#18A303' },
      { name: 'ONLYOFFICE', icon: 'bi bi-building', color: '#FF6F3D' },
      { name: 'Diğer Ofis programları', icon: 'bi bi-three-dots', color: '#8888AA' }
    ]
  },
  {
    name: 'Video Düzenleme',
    icon: 'bi bi-camera-reels-fill',
    color: '#00ADEF',
    subcategories: [
      { name: 'Capcut', icon: 'bi bi-scissors', color: '#00D4AA' },
      { name: 'Davinci Resolve', icon: 'si-davinciresolve', color: '#FF2E00' },
      { name: 'Premiere Pro', icon: 'bi bi-film', color: '#9999FF' },
      { name: 'Sony Vegas', icon: 'bi bi-collection-play', color: '#00ADEF' },
      { name: 'After Effects', icon: 'bi bi-magic', color: '#9999FF' }
    ]
  },
  {
    name: 'Programlama',
    icon: 'bi bi-code-slash',
    color: '#3776AB',
    subcategories: [
      { name: 'JavaScript', icon: 'si-javascript', color: '#F7DF1E' },
      { name: 'HTML', icon: 'si-html5', color: '#E34F26' },
      { name: 'CSS', icon: 'bi bi-brush', color: '#1572B6' },
      { name: 'Python', icon: 'si-python', color: '#3776AB' },
      { name: 'Perl', icon: 'bi bi-hypnotize', color: '#39457E' },
      { name: 'Rust', icon: 'si-rust', color: '#CE422B' },
      { name: 'C', icon: 'si-c', color: '#5C8DBC' },
      { name: 'C++', icon: 'si-cplusplus', color: '#00599C' },
      { name: 'C#', icon: 'bi bi-hash', color: '#239120' },
      { name: 'Java', icon: 'bi bi-cup-hot', color: '#ED8B00' },
      { name: 'Ruby', icon: 'si-ruby', color: '#CC342D' }
    ]
  },
  {
    name: 'Yapay Zeka',
    icon: 'bi bi-robot',
    color: '#A855F7',
    subcategories: [
      { name: 'Yapay Zeka Temelleri', icon: 'bi bi-cpu', color: '#A855F7' },
      { name: 'Makine Öğrenmesi', icon: 'bi bi-diagram-3', color: '#7C3AED' },
      { name: 'Derin Öğrenme', icon: 'bi bi-layers', color: '#6D28D9' },
      { name: 'Doğal Dil İşleme', icon: 'bi bi-chat-text', color: '#8B5CF6' },
      { name: 'Görüntü İşleme', icon: 'bi bi-image', color: '#9F67FF' },
      { name: 'Generative AI', icon: 'bi bi-stars', color: '#C084FC' }
    ]
  }
];

export const POPULAR_CATEGORIES = [
  { name: 'Python', color: '#3776AB' },
  { name: 'Arch Linux', color: '#1793D1' },
  { name: 'JavaScript', color: '#F7DF1E' }
];
