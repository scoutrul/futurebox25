export const useBuildingData = () => {
  const buildingData = {
    name: "Futurebox Residence",
    developer: "Futurebox Development",
    status: "В строительстве",
    completionDate: "Q4 2025",
    totalFloors: 25,
    totalUnits: 180,
    availableUnits: 45,
    priceRange: {
      min: 85000,
      max: 250000
    },
    apartmentTypes: [
      { type: "1-комн", area: "45-55 м²", price: "от $85,000", image: "img/e1.jpg" },
      { type: "2-комн", area: "65-80 м²", price: "от $125,000", image: "img/e2.jpg" },
      { type: "3-комн", area: "90-120 м²", price: "от $180,000", image: "img/e3.jpg" }
    ],
    floorPlans: [
      {
        type: "1-комн",
        area: "52 м²",
        rooms: "1 спальня, гостиная-кухня, санузел",
        features: ["Панорамные окна", "Балкон 6 м²", "Встроенная кухня"]
      },
      {
        type: "2-комн",
        area: "74 м²",
        rooms: "2 спальни, гостиная, кухня, 2 санузла",
        features: ["Мастер-спальня с гардеробной", "Балкон 8 м²", "Кладовая"]
      },
      {
        type: "3-комн",
        area: "105 м²",
        rooms: "3 спальни, гостиная, кухня, 2 санузла",
        features: ["2 балкона", "Гардеробная", "Кабинет", "Кладовая"]
      }
    ],
    amenities: [
      "Подземный паркинг",
      "Фитнес-центр",
      "Детская площадка",
      "Консьерж-сервис",
      "Панорамные окна"
    ],
    location: {
      district: "Медеуский район",
      nearbyPlaces: [
        "Ледовый каток Медеу - 2 км",
        "Горнолыжная база Шымбулак - 5 км",
        "Центр города - 15 км"
      ]
    },
    contact: {
      phone: "+7 (727) 123-45-67",
      email: "sales@futurebox.kz",
      office: "пр. Достык, 123"
    }
  }

  return {
    buildingData
  }
}
