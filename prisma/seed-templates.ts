import { PrismaClient } from "@prisma/client";

/**
 * Seed script — populates StoryTemplate collection with default templates.
 * Run with: npx tsx prisma/seed-templates.ts
 */

const prisma = new PrismaClient();

const templates = [
  {
    title: "The Haunted Lighthouse",
    description:
      "A spine-chilling tale of a lighthouse keeper who discovers the source of mysterious lights and whispers during a violent storm.",
    prompt:
      "A lonely lighthouse keeper on a remote island begins hearing whispers during a violent storm. The lighthouse beam reveals ghostly figures walking on the water. As the night progresses, the keeper discovers that the lighthouse was built on the site of a shipwreck, and the drowned sailors are trying to guide a new ship away from the rocks. The keeper must choose between saving the approaching ship and confronting the ghosts of the past.",
    genre: "horror",
  },
  {
    title: "Love in the Rain",
    description:
      "Two strangers share an umbrella during an unexpected downpour in Tokyo, leading to a heartwarming connection.",
    prompt:
      "Two strangers meet under a small awning during a sudden rainstorm in Tokyo. One has an umbrella, the other doesn't. They decide to share the umbrella and walk together through the rain-soaked streets, discovering they have more in common than they expected. Along the way, they visit a tiny ramen shop, share stories about their lives, and realize this chance encounter might be the beginning of something beautiful.",
    genre: "romance",
  },
  {
    title: "The Last Robot",
    description:
      "In a post-apocalyptic world, the last functioning robot embarks on a journey to find its creator.",
    prompt:
      "In a world where humanity has abandoned Earth for Mars, one robot remains active among billions of deactivated machines. It discovers a fading message from its creator asking it to deliver a crucial memory chip to a hidden bunker. The robot traverses crumbling cities, overgrown forests, and dried-up oceans, encountering remnants of human civilization. At the bunker, it finds a time capsule meant for future generations and must decide whether to broadcast the message to Mars or protect Earth's legacy.",
    genre: "sci-fi",
  },
  {
    title: "The Dragon's Garden",
    description:
      "A young herbalist discovers a hidden garden tended by a wise dragon and learns the secret of magical plants.",
    prompt:
      "A young herbalist stumbles upon a hidden valley where a centuries-old dragon tends a garden of magical plants. Each flower has unique powers — one heals wounds, another reveals truth, a third grants temporary flight. The dragon offers to teach the herbalist the secrets of the garden, but warns that knowledge comes with responsibility. When a neighboring kingdom threatens the valley, the herbalist must use what they've learned to protect both the dragon and the garden.",
    genre: "fantasy",
  },
  {
    title: "The Comedy Club Disaster",
    description:
      "A nervous first-time comedian's open mic night goes hilariously wrong in the best possible way.",
    prompt:
      "A shy accountant decides to try stand-up comedy at an open mic night after being dared by coworkers. Everything that could go wrong does — the microphone cuts out, a heckler won't stop, and the comedian accidentally knocks over a drink on a front-row audience member. But each disaster gets bigger laughs from the crowd. By the end of the night, the accountant realizes that embracing failure might be the secret to comedy, and life.",
    genre: "comedy",
  },
  {
    title: "The Midnight Detective",
    description:
      "A detective who can only work at night investigates a series of art thefts where the stolen paintings come to life.",
    prompt:
      "A detective with a rare light sensitivity condition investigates a series of art thefts from a prestigious museum. The twist: each stolen painting is replaced by a perfect copy, except the figures in the paintings have changed poses. As the detective digs deeper, they discover the paintings are actually portals, and the figures are real people trapped inside by a centuries-old curse. The detective must solve the mystery before the next full moon or the trapped souls will be lost forever.",
    genre: "mystery",
  },
  {
    title: "The Solar System Tour",
    description:
      "An exciting educational journey through our solar system, visiting each planet and learning fascinating facts.",
    prompt:
      "Take a thrilling spaceship tour through our solar system! Start from the scorching surface of Mercury, fly through Venus's thick clouds, wave hello to Earth, explore Mars's red canyons, dodge Jupiter's massive storms, admire Saturn's beautiful rings, visit the tilted Uranus, and brave Neptune's supersonic winds. Each planet reveals amazing facts about size, temperature, moons, and what makes it unique. End the journey by looking back at our tiny pale blue dot from the edge of the solar system.",
    genre: "educational",
  },
  {
    title: "The Mountain Within",
    description:
      "A powerful motivational story about overcoming self-doubt through the metaphor of climbing an impossible mountain.",
    prompt:
      "A young climber stands at the base of an impossibly tall mountain that represents their greatest fears and self-doubt. With each step upward, they face challenges — fierce winds of criticism, fog of confusion, rockfalls of past failures. Along the way, they meet other climbers who share wisdom: a veteran who teaches patience, a child who teaches wonder, and a stranger who teaches trust. At the summit, the climber discovers the mountain was never about reaching the top — it was about discovering who they became during the climb.",
    genre: "motivational",
  },
  {
    title: "The Magical Bookshop",
    description:
      "A child discovers a bookshop where the stories come alive and learns the power of imagination.",
    prompt:
      "A curious child wanders into an old bookshop tucked away in a quiet alley. The shopkeeper, a kind elderly woman with twinkling eyes, tells them to pick any book. When the child opens a fairy tale, the illustrations start moving and the characters step off the pages. Together with a brave princess and a talking fox from the story, the child goes on an adventure through different books — a pirate ship, an enchanted forest, and a candy kingdom. In the end, the child learns that every story lives inside the reader's imagination.",
    genre: "fairy-tale",
  },
  {
    title: "The Chase",
    description:
      "A journalist uncovers a conspiracy and must race across the city to expose the truth before time runs out.",
    prompt:
      "A journalist receives an anonymous flash drive containing evidence of a massive corporate cover-up that threatens public safety. Within hours, mysterious agents begin pursuing them across the city. The journalist must navigate through crowded markets, underground tunnels, and rooftop escapes while decrypting the files on the flash drive. With each revelation, the conspiracy grows deeper. The journalist has until midnight to reach the TV station and broadcast the truth before the evidence is remotely wiped.",
    genre: "thriller",
  },
  {
    title: "A Family Reunion",
    description:
      "Three estranged siblings reunite at their childhood home and confront old wounds to find healing.",
    prompt:
      "Three siblings who haven't spoken in years are forced to return to their childhood home when they discover their late mother left them a joint inheritance with one condition — they must spend a weekend together in the house. Old arguments resurface, hidden letters are discovered, and childhood memories flood back. Through laughter, tears, and a shared meal cooked from their mother's recipe book, the siblings slowly begin to understand each other's pain and find a path toward forgiveness and reconnection.",
    genre: "drama",
  },
];

async function main() {
  console.log("Seeding story templates...");

  // Check if templates already exist
  const existingCount = await prisma.storyTemplate.count();
  if (existingCount > 0) {
    console.log(
      `Found ${existingCount} existing templates. Skipping seed to avoid duplicates.`
    );
    return;
  }

  for (const template of templates) {
    await prisma.storyTemplate.create({ data: template });
  }

  console.log(`Seeded ${templates.length} story templates.`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
