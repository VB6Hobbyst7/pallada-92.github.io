function SphereData() {
  
  var sphere_item_classes = {
    1: {
      icon: 'icons/ico_1.png',
      link: 'http://google.com/',
      title: 'icon 1 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    2: {
      icon: 'icons/ico_2.png',
      link: 'http://google.com/',
      title: 'icon 2 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    3: {
      icon: 'icons/ico_3.png',
      link: 'http://google.com/',
      title: 'icon 3 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    4: {
      icon: 'icons/ico_4.png',
      link: 'http://google.com/',
      title: 'icon 4 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    5: {
      icon: 'icons/ico_5.png',
      link: 'http://google.com/',
      title: 'icon 5 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    6: {
      icon: 'icons/ico_6.png',
      link: 'http://google.com/',
      title: 'icon 6 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    7: {
      icon: 'icons/ico_7.png',
      link: 'http://google.com/',
      title: 'icon 7 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
    8: {
      icon: 'icons/ico_8.png',
      link: 'http://google.com/',
      title: 'icon 8 title',
      text: 'Модуль, позволяющий создавать\nшаблоны документов, автозаполнение,\nлегкое редактирование и полное\nлогирование пользователей.'
    },
  }

  function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  this.onclick = function(item, i) {
    alert('Нажата вершина с номером ' + i);
    // window.location.href = item.link;
  }
  
  this.items = {
    0: copyObj(sphere_item_classes[5]),
    1: copyObj(sphere_item_classes[1]),
    2: copyObj(sphere_item_classes[2]),
    3: copyObj(sphere_item_classes[3]),
    4: copyObj(sphere_item_classes[4]),
    5: copyObj(sphere_item_classes[5]),
    6: copyObj(sphere_item_classes[6]),
    7: copyObj(sphere_item_classes[7]),
    8: copyObj(sphere_item_classes[8]),
    9: copyObj(sphere_item_classes[4]),
    10: copyObj(sphere_item_classes[5]),
    11: copyObj(sphere_item_classes[1]),
    12: copyObj(sphere_item_classes[2]),
    13: copyObj(sphere_item_classes[3]),
    14: copyObj(sphere_item_classes[4]),
    15: copyObj(sphere_item_classes[5]),
    16: copyObj(sphere_item_classes[6]),
    17: copyObj(sphere_item_classes[7]),
    18: copyObj(sphere_item_classes[8]),
    19: copyObj(sphere_item_classes[4]),
    20: copyObj(sphere_item_classes[5]),
    21: copyObj(sphere_item_classes[1]),
    22: copyObj(sphere_item_classes[2]),
    23: copyObj(sphere_item_classes[3]),
    24: copyObj(sphere_item_classes[4]),
    25: copyObj(sphere_item_classes[5]),
    26: copyObj(sphere_item_classes[6]),
    27: copyObj(sphere_item_classes[7]),
    28: copyObj(sphere_item_classes[8]),
    29: copyObj(sphere_item_classes[4]),
    30: copyObj(sphere_item_classes[5]),
    31: copyObj(sphere_item_classes[1]),
    32: copyObj(sphere_item_classes[2]),
    33: copyObj(sphere_item_classes[3]),
    34: copyObj(sphere_item_classes[4]),
    35: copyObj(sphere_item_classes[5]),
    36: copyObj(sphere_item_classes[6]),
    37: copyObj(sphere_item_classes[7]),
    38: copyObj(sphere_item_classes[8]),
    39: copyObj(sphere_item_classes[4]),
    40: copyObj(sphere_item_classes[5]),
    41: copyObj(sphere_item_classes[1]),
  }
}
