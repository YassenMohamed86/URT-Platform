import { getDb } from "../api/queries/connection";
import { questions } from "./schema";

const db = getDb();

// English passages and questions
const englishPassages = [
  {
    title: "The Art of Scientific Communication",
    text: "Scientific communication is the practice of informing, educating, and raising awareness of science-related topics. It encompasses a wide range of activities, from publishing research papers in academic journals to presenting findings at conferences and engaging with the public through media. The primary goal of scientific communication is to make complex scientific concepts accessible to diverse audiences. This requires scientists to develop skills beyond their technical expertise, including the ability to translate jargon into everyday language and to craft compelling narratives around their work. Effective scientific communication not only advances individual careers but also fosters public trust in science and informed decision-making on critical issues.",
    questions: [
      { text: "What is the primary goal of scientific communication?", a: "To publish more papers", b: "To win research grants", c: "To make complex concepts accessible", d: "To compete with other scientists", correct: "C", difficulty: "easy" as const, skill: "Main Idea" },
      { text: "According to the passage, effective scientific communication helps scientists:", a: "Avoid peer review", b: "Develop skills beyond technical expertise", c: "Work in isolation", d: "Reduce their research output", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The word 'jargon' in the passage most nearly means:", a: "Simple language", b: "Technical vocabulary", c: "Foreign words", d: "Poetic expressions", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "The passage suggests that public trust in science is:", a: "Unrelated to communication", b: "Fostered by effective communication", c: "Declining rapidly", d: "Only important for politicians", correct: "B", difficulty: "easy" as const, skill: "Inference" },
      { text: "Which of the following is NOT mentioned as a form of scientific communication?", a: "Publishing in journals", b: "Conference presentations", c: "Writing fiction novels", d: "Media engagement", correct: "C", difficulty: "easy" as const, skill: "Detail" },
      { text: "The passage implies that scientists who communicate well:", a: "Are less focused on research", b: "Can advance their careers", c: "Do not need technical skills", d: "Work only in academia", correct: "B", difficulty: "medium" as const, skill: "Inference" },
      { text: "'Compelling narratives' in the passage refers to:", a: "Fictional stories about science", b: "Engaging ways to present research", c: "Scientific myths", d: "Historical accounts", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "The passage is primarily concerned with:", a: "Criticizing poor communication", b: "Describing the importance and practice of scientific communication", c: "Listing scientific achievements", d: "Comparing different scientific fields", correct: "B", difficulty: "medium" as const, skill: "Main Idea" },
      { text: "According to the author, scientific communication requires:", a: "Only technical knowledge", b: "No special skills", c: "Translation skills for diverse audiences", d: "Formal education in journalism", correct: "C", difficulty: "easy" as const, skill: "Detail" },
      { text: "The tone of the passage can best be described as:", a: "Critical and dismissive", b: "Informative and appreciative", c: "Humorous and light", d: "Angry and frustrated", correct: "B", difficulty: "medium" as const, skill: "Tone" },
    ],
  },
  {
    title: "Urban Biodiversity",
    text: "Cities are often perceived as biological deserts, dominated by concrete and steel with little room for nature. However, recent research challenges this view, revealing that urban areas can support surprising levels of biodiversity. From rooftop gardens to roadside verges, cities provide a mosaic of habitats that can sustain a variety of plant and animal species. Urban parks serve as crucial green corridors, connecting fragmented habitats and allowing wildlife to move through the cityscape. Even small patches of vegetation, such as those found in backyards and community gardens, contribute to urban biodiversity by providing food and shelter for insects, birds, and small mammals. The key to enhancing urban biodiversity lies in thoughtful urban planning that incorporates green infrastructure, such as green roofs, rain gardens, and native plant landscaping, into the fabric of the city.",
    questions: [
      { text: "The passage challenges the view that cities are:", a: "Too expensive to live in", b: "Biological deserts", c: "Overpopulated", d: "Environmentally friendly", correct: "B", difficulty: "easy" as const, skill: "Main Idea" },
      { text: "Urban parks serve as:", a: "Recreational facilities only", b: "Green corridors connecting habitats", c: "Waste disposal areas", d: "Commercial spaces", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The word 'mosaic' in the passage most nearly means:", a: "Single uniform area", b: "Diverse collection of varied elements", c: "Ancient artwork", d: "Dense forest", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "According to the passage, which contributes to urban biodiversity?", a: "Concrete buildings only", b: "Small patches of vegetation", c: "Highways and roads", d: "Industrial zones", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The author suggests that enhancing urban biodiversity requires:", a: "Removing all buildings", b: "Thoughtful urban planning with green infrastructure", c: "Relocating wildlife to rural areas", d: "Banning urban development", correct: "B", difficulty: "easy" as const, skill: "Inference" },
      { text: "'Green infrastructure' in the passage refers to:", a: "Financial investments in environmental companies", b: "Physical structures like green roofs and rain gardens", c: "Digital technology for monitoring nature", d: "Military installations in forests", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "The passage implies that biodiversity in cities is:", a: "Impossible to maintain", b: "Surprisingly high with proper planning", c: "Only found in large parks", d: "Declining despite conservation efforts", correct: "B", difficulty: "medium" as const, skill: "Inference" },
      { text: "Roadside verges are mentioned as:", a: "Hazards for drivers", b: "Potential habitats for species", c: "Sources of pollution", d: "Commercial developments", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The author's attitude toward urban biodiversity can be described as:", a: "Pessimistic", b: "Optimistic", c: "Indifferent", d: "Hostile", correct: "B", difficulty: "easy" as const, skill: "Tone" },
      { text: "Which of the following is NOT mentioned as green infrastructure?", a: "Green roofs", b: "Rain gardens", c: "Native plant landscaping", d: "Solar panels", correct: "D", difficulty: "easy" as const, skill: "Detail" },
    ],
  },
  {
    title: "The Economics of Renewable Energy",
    text: "The transition to renewable energy sources has accelerated dramatically over the past decade, driven by a combination of technological advances, policy incentives, and growing environmental awareness. Solar and wind power, once considered expensive alternatives, have become cost-competitive with fossil fuels in many parts of the world. The levelized cost of electricity from solar photovoltaic systems has dropped by nearly 90% since 2010, while onshore wind costs have fallen by about 70%. This remarkable decline is largely attributable to economies of scale, improvements in manufacturing processes, and increased efficiency of energy conversion. However, the intermittent nature of renewable sources presents challenges for grid stability, requiring investments in energy storage solutions and smart grid technologies. Despite these challenges, the economic case for renewable energy continues to strengthen, with many countries setting ambitious targets for carbon neutrality.",
    questions: [
      { text: "The primary driver of renewable energy transition mentioned is:", a: "Government mandates only", b: "A combination of technology, policy, and awareness", c: "Fossil fuel shortages", d: "International pressure", correct: "B", difficulty: "easy" as const, skill: "Main Idea" },
      { text: "Solar photovoltaic costs have dropped by approximately:", a: "50%", b: "70%", c: "90%", d: "30%", correct: "C", difficulty: "easy" as const, skill: "Detail" },
      { text: "The word 'intermittent' in the passage most nearly means:", a: "Constant and steady", b: "Occurring at irregular intervals", c: "Extremely powerful", d: "Completely reliable", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "According to the passage, the cost decline is attributable to:", a: "Government subsidies alone", b: "Economies of scale and improved manufacturing", c: "Reduced demand for electricity", d: "Decreased quality of equipment", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The challenge of renewable energy mentioned is:", a: "High costs", b: "Grid stability due to intermittency", c: "Lack of public support", d: "Excessive pollution", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The passage suggests that energy storage solutions are needed for:", a: "Reducing costs", b: "Addressing grid stability challenges", c: "Increasing fossil fuel use", d: "Eliminating wind power", correct: "B", difficulty: "easy" as const, skill: "Inference" },
      { text: "'Levelized cost of electricity' refers to:", a: "The initial installation price", b: "The average cost over the lifetime of a system", c: "Government subsidies", d: "Monthly electricity bills", correct: "B", difficulty: "hard" as const, skill: "Vocabulary" },
      { text: "The tone of the passage is best described as:", a: "Alarmist", b: "Analytical and optimistic", c: "Dismissive of renewables", d: "Highly technical", correct: "B", difficulty: "medium" as const, skill: "Tone" },
      { text: "Many countries are setting targets for:", a: "Increased fossil fuel use", b: "Carbon neutrality", c: "Nuclear energy expansion", d: "Reduced electricity consumption", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The passage implies that renewable energy:", a: "Will never replace fossil fuels", b: "Is becoming economically viable", c: "Causes more pollution", d: "Requires no technological improvements", correct: "B", difficulty: "medium" as const, skill: "Inference" },
    ],
  },
  {
    title: "Memory and Learning",
    text: "Memory is fundamental to the learning process, serving as the foundation upon which new knowledge is built. Cognitive scientists have identified several types of memory, each playing a distinct role in how we acquire and retain information. Working memory, often described as the brain's temporary workspace, allows us to hold and manipulate information for short periods. This capacity is limited, typically allowing most adults to hold about seven items simultaneously. Long-term memory, by contrast, has virtually unlimited capacity and can store information for extended periods, from hours to a lifetime. The transfer of information from working memory to long-term memory is facilitated by rehearsal, meaningful association, and emotional connection. Understanding these mechanisms has profound implications for education, suggesting that effective teaching strategies should minimize cognitive overload while promoting deep processing of material through spaced repetition and contextual learning.",
    questions: [
      { text: "The passage is primarily concerned with:", a: "Criticizing modern education", b: "Describing memory types and their role in learning", c: "Comparing human and animal memory", d: "Promoting memory supplements", correct: "B", difficulty: "easy" as const, skill: "Main Idea" },
      { text: "Working memory is described as:", a: "Having unlimited capacity", b: "The brain's temporary workspace", c: "Only storing long-term information", d: "A type of computer memory", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The typical capacity of working memory is about:", a: "Three items", b: "Seven items", c: "Twenty items", d: "Unlimited items", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "Information transfers to long-term memory through:", a: "Sleep only", b: "Rehearsal and meaningful association", c: "Physical exercise", d: "Medication", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "'Cognitive overload' in the passage refers to:", a: "Excessive brain size", b: "Overwhelming working memory capacity", c: "Too much sleep", d: "Physical exhaustion", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "The passage suggests effective teaching should include:", a: "Memorization only", b: "Spaced repetition and contextual learning", c: "Eliminating working memory use", d: "Long lectures without breaks", correct: "B", difficulty: "easy" as const, skill: "Inference" },
      { text: "The word 'profound' most nearly means:", a: "Slight", b: "Deep and significant", c: "Confusing", d: "Temporary", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "According to the passage, emotional connection:", a: "Hinders memory", b: "Facilitates transfer to long-term memory", c: "Is irrelevant to learning", d: "Only affects short-term memory", correct: "B", difficulty: "medium" as const, skill: "Detail" },
      { text: "The passage implies that understanding memory mechanisms helps:", a: "Develop better teaching strategies", b: "Increase brain size", c: "Eliminate the need for schools", d: "Create memory competitions", correct: "A", difficulty: "easy" as const, skill: "Inference" },
      { text: "Long-term memory is characterized by:", a: "Limited seven-item capacity", b: "Virtually unlimited capacity", c: "Only storing for minutes", d: "Requiring constant rehearsal", correct: "B", difficulty: "easy" as const, skill: "Detail" },
    ],
  },
  {
    title: "The Future of Work",
    text: "The nature of work is undergoing a profound transformation, driven by automation, artificial intelligence, and changing societal expectations. Remote work, once a rarity, has become mainstream, with many organizations adopting hybrid models that blend office and home-based work. This shift has implications for urban planning, as reduced commuting may reshape cities and transportation networks. Simultaneously, automation threatens to displace workers in routine-intensive occupations while creating new opportunities in fields requiring creativity, emotional intelligence, and complex problem-solving. The gig economy continues to expand, offering flexibility but often at the cost of job security and benefits. As these trends converge, policymakers face the challenge of ensuring that the benefits of technological progress are broadly shared, potentially through mechanisms such as universal basic income, reskilling programs, and portable benefits for gig workers. The future of work will likely be defined not by technology alone, but by the choices societies make about how to harness it.",
    questions: [
      { text: "The passage is primarily concerned with:", a: "Criticizing remote work", b: "Describing transformations in the nature of work", c: "Promoting automation", d: "Comparing different careers", correct: "B", difficulty: "easy" as const, skill: "Main Idea" },
      { text: "Remote work has become:", a: "Illegal", b: "Mainstream", c: "Less popular", d: "Only for tech workers", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "Automation threatens workers in:", a: "Creative occupations", b: "Routine-intensive occupations", c: "Management roles", d: "All occupations equally", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "The gig economy offers:", a: "Only full-time positions", b: "Flexibility but often less security", c: "Government benefits", d: "No work opportunities", correct: "B", difficulty: "easy" as const, skill: "Detail" },
      { text: "'Hybrid models' in the passage refer to:", a: "Electric cars", b: "Blended office and home-based work", c: "Mixed farming techniques", d: "Genetic combinations", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "The passage suggests policymakers should focus on:", a: "Banning automation", b: "Ensuring benefits are broadly shared", c: "Eliminating remote work", d: "Reducing worker wages", correct: "B", difficulty: "easy" as const, skill: "Inference" },
      { text: "Which is NOT mentioned as a potential policy response?", a: "Universal basic income", b: "Reskilling programs", c: "Mandatory retirement", d: "Portable benefits", correct: "C", difficulty: "easy" as const, skill: "Detail" },
      { text: "The word 'converge' most nearly means:", a: "Move apart", b: "Come together from different directions", c: "Disappear", d: "Cause conflict", correct: "B", difficulty: "medium" as const, skill: "Vocabulary" },
      { text: "The passage implies the future of work depends on:", a: "Technology alone", b: "Societal choices about technology", c: "Government control", d: "Eliminating the gig economy", correct: "B", difficulty: "medium" as const, skill: "Inference" },
      { text: "The tone of the passage is best described as:", a: "Alarmist", b: "Analytical and balanced", c: "Dismissive of workers", d: "Overly optimistic", correct: "B", difficulty: "medium" as const, skill: "Tone" },
    ],
  },
];

// Biology passages and questions
const biologyPassages = [
  {
    title: "Cell Structure and Function",
    text: "Cells are the basic structural and functional units of all living organisms. A typical eukaryotic cell contains several key organelles, each with specialized functions. The nucleus houses the cell's genetic material (DNA) and controls cellular activities. Mitochondria, often called the powerhouse of the cell, generate ATP through cellular respiration. The endoplasmic reticulum serves as a manufacturing and transport system, with rough ER studded with ribosomes for protein synthesis and smooth ER involved in lipid synthesis. The Golgi apparatus modifies, packages, and ships proteins to their destinations. Lysosomes contain digestive enzymes that break down waste materials. The cell membrane, composed of a phospholipid bilayer, regulates what enters and exits the cell, maintaining homeostasis.",
    questions: [
      { text: "Which organelle generates ATP through cellular respiration?", a: "Nucleus", b: "Mitochondria", c: "Golgi apparatus", d: "Lysosome", correct: "B", difficulty: "easy" as const, skill: "Cell Biology" },
      { text: "The nucleus primarily functions to:", a: "Generate energy", b: "House genetic material", c: "Digest waste", d: "Transport proteins", correct: "B", difficulty: "easy" as const, skill: "Cell Biology" },
      { text: "Rough ER is distinguished by:", a: "Lipid synthesis", b: "Ribosomes on its surface", c: "DNA storage", d: "Waste breakdown", correct: "B", difficulty: "easy" as const, skill: "Cell Biology" },
      { text: "The cell membrane is composed of:", a: "Protein bilayer", b: "Phospholipid bilayer", c: "Carbohydrate layer", d: "DNA strands", correct: "B", difficulty: "easy" as const, skill: "Cell Biology" },
      { text: "Lysosomes are responsible for:", a: "Protein synthesis", b: "Breaking down waste materials", c: "Energy production", d: "Cell division", correct: "B", difficulty: "easy" as const, skill: "Cell Biology" },
    ],
  },
  {
    title: "Photosynthesis",
    text: "Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. This process occurs primarily in the chloroplasts of plant cells, specifically within structures called thylakoids. The overall equation can be summarized as: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. Photosynthesis consists of two main stages: the light-dependent reactions and the Calvin cycle (light-independent reactions). During the light-dependent reactions, occurring in the thylakoid membranes, chlorophyll absorbs light energy to produce ATP and NADPH, with oxygen released as a byproduct. The Calvin cycle, occurring in the stroma, uses ATP and NADPH to convert carbon dioxide into glucose through a series of enzyme-mediated reactions. Factors affecting photosynthesis include light intensity, carbon dioxide concentration, and temperature.",
    questions: [
      { text: "Where does photosynthesis primarily occur?", a: "Mitochondria", b: "Chloroplasts", c: "Nucleus", d: "Ribosomes", correct: "B", difficulty: "easy" as const, skill: "Photosynthesis" },
      { text: "What is the byproduct of the light-dependent reactions?", a: "Carbon dioxide", b: "Glucose", c: "Oxygen", d: "Water", correct: "C", difficulty: "easy" as const, skill: "Photosynthesis" },
      { text: "The Calvin cycle occurs in the:", a: "Thylakoid membranes", b: "Stroma", c: "Cytoplasm", d: "Nucleus", correct: "B", difficulty: "easy" as const, skill: "Photosynthesis" },
      { text: "Which pigment absorbs light energy?", a: "Hemoglobin", b: "Chlorophyll", c: "Melanin", d: "Carotene", correct: "B", difficulty: "easy" as const, skill: "Photosynthesis" },
      { text: "Which factor does NOT affect photosynthesis?", a: "Light intensity", b: "CO2 concentration", c: "Temperature", d: "Sound frequency", correct: "D", difficulty: "easy" as const, skill: "Photosynthesis" },
    ],
  },
  {
    title: "Genetics and Heredity",
    text: "Genetics is the study of heredity and the variation of inherited characteristics. Gregor Mendel, known as the father of modern genetics, established fundamental principles through his experiments with pea plants in the mid-19th century. Mendel's Laws of Inheritance include the Law of Segregation, which states that allele pairs separate during gamete formation, and the Law of Independent Assortment, which states that genes for different traits segregate independently. DNA (deoxyribonucleic acid) is the molecule that carries genetic information. It consists of two complementary strands twisted into a double helix, with nucleotide bases (adenine, thymine, guanine, and cytosine) pairing in specific ways: A with T, and G with C. Genes are segments of DNA that code for proteins, which determine traits. Mutations, or changes in DNA sequences, can lead to genetic variation, which is the raw material for evolution through natural selection.",
    questions: [
      { text: "Who is known as the father of modern genetics?", a: "Charles Darwin", b: "Gregor Mendel", c: "Louis Pasteur", d: "Albert Einstein", correct: "B", difficulty: "easy" as const, skill: "Genetics" },
      { text: "The Law of Segregation states that:", a: "Genes blend together", b: "Allele pairs separate during gamete formation", c: "All traits are dominant", d: "Environment determines traits", correct: "B", difficulty: "medium" as const, skill: "Genetics" },
      { text: "In DNA, adenine pairs with:", a: "Guanine", b: "Cytosine", c: "Thymine", d: "Uracil", correct: "C", difficulty: "easy" as const, skill: "Genetics" },
      { text: "Genes code for:", a: "Lipids", b: "Carbohydrates", c: "Proteins", d: "Vitamins", correct: "C", difficulty: "easy" as const, skill: "Genetics" },
      { text: "Mutations provide raw material for:", a: "Cloning", b: "Evolution through natural selection", c: "Photosynthesis", d: "Cell division", correct: "B", difficulty: "medium" as const, skill: "Genetics" },
    ],
  },
  {
    title: "Human Circulatory System",
    text: "The human circulatory system is a closed system consisting of the heart, blood vessels, and blood. The heart, a muscular organ about the size of a fist, acts as a pump that circulates blood throughout the body. It has four chambers: two atria (upper chambers) and two ventricles (lower chambers). The right side of the heart pumps deoxygenated blood to the lungs for oxygenation (pulmonary circulation), while the left side pumps oxygenated blood to the rest of the body (systemic circulation). Blood vessels include arteries (carrying blood away from the heart), veins (carrying blood toward the heart), and capillaries (tiny vessels where gas and nutrient exchange occurs). Blood is composed of red blood cells (carrying oxygen via hemoglobin), white blood cells (fighting infections), platelets (clotting), and plasma (the liquid matrix). The average adult has about 5 liters of blood, which completes a full circuit approximately every minute.",
    questions: [
      { text: "How many chambers does the human heart have?", a: "Two", b: "Three", c: "Four", d: "Five", correct: "C", difficulty: "easy" as const, skill: "Human Biology" },
      { text: "Which side of the heart pumps blood to the lungs?", a: "Left side", b: "Right side", c: "Both sides", d: "Neither side", correct: "B", difficulty: "easy" as const, skill: "Human Biology" },
      { text: "Capillaries are responsible for:", a: "Pumping blood", b: "Gas and nutrient exchange", c: "Storing blood", d: "Filtering waste", correct: "B", difficulty: "easy" as const, skill: "Human Biology" },
      { text: "Red blood cells carry oxygen via:", a: "White blood cells", b: "Hemoglobin", c: "Platelets", d: "Plasma", correct: "B", difficulty: "easy" as const, skill: "Human Biology" },
      { text: "Veins carry blood:", a: "Away from the heart", b: "Toward the heart", c: "Only to the brain", d: "To the lungs only", correct: "B", difficulty: "easy" as const, skill: "Human Biology" },
    ],
  },
  {
    title: "Ecology and Ecosystems",
    text: "Ecology is the scientific study of the interactions between organisms and their environment. An ecosystem consists of all the living organisms (biotic factors) and non-living components (abiotic factors) in a particular area, and the interactions among them. Energy flows through ecosystems via food chains and food webs, starting with producers (autotrophs like plants) that convert solar energy into chemical energy through photosynthesis. Primary consumers (herbivores) eat producers, secondary consumers (carnivores) eat primary consumers, and tertiary consumers eat secondary consumers. Decomposers, such as bacteria and fungi, break down dead organic matter, returning nutrients to the soil. Each level of the food chain is called a trophic level. As energy moves up trophic levels, approximately 90% is lost as heat, following the 10% rule of energy transfer. This inefficiency explains why food chains rarely exceed five trophic levels.",
    questions: [
      { text: "Producers in an ecosystem are:", a: "Herbivores", b: "Carnivores", c: "Autotrophs like plants", d: "Decomposers", correct: "C", difficulty: "easy" as const, skill: "Ecology" },
      { text: "Approximately what percentage of energy is lost between trophic levels?", a: "10%", b: "50%", c: "90%", d: "25%", correct: "C", difficulty: "easy" as const, skill: "Ecology" },
      { text: "Decomposers include:", a: "Only bacteria", b: "Bacteria and fungi", c: "Only fungi", d: "Plants", correct: "B", difficulty: "easy" as const, skill: "Ecology" },
      { text: "Food chains rarely exceed how many trophic levels?", a: "Three", b: "Five", c: "Ten", d: "Two", correct: "B", difficulty: "easy" as const, skill: "Ecology" },
      { text: "Energy in ecosystems flows from:", a: "Consumers to producers", b: "Sun to producers to consumers", c: "Decomposers to producers", d: "Water to land", correct: "B", difficulty: "easy" as const, skill: "Ecology" },
    ],
  },
];

// Geology passages and questions
const geologyPassages = [
  {
    title: "Plate Tectonics",
    text: "Plate tectonics is the scientific theory that Earth's lithosphere is divided into rigid plates that move slowly over the asthenosphere, the partially molten layer beneath. This theory explains the distribution of earthquakes, volcanoes, and mountain ranges around the globe. There are three main types of plate boundaries: divergent boundaries where plates move apart (such as mid-ocean ridges), convergent boundaries where plates collide (creating mountains or subduction zones), and transform boundaries where plates slide past each other (like the San Andreas Fault). The movement of these plates is driven by convection currents in the mantle, where hot material rises and cooler material sinks. Alfred Wegener first proposed continental drift in 1912, though his theory was not widely accepted until the 1960s when evidence from paleomagnetism and seafloor spreading supported the concept.",
    questions: [
      { text: "What drives the movement of tectonic plates?", a: "Ocean currents", b: "Convection currents in the mantle", c: "Solar radiation", d: "Wind patterns", correct: "B", difficulty: "easy" as const, skill: "Plate Tectonics" },
      { text: "At divergent boundaries, plates:", a: "Collide", b: "Move apart", c: "Slide past each other", d: "Remain stationary", correct: "B", difficulty: "easy" as const, skill: "Plate Tectonics" },
      { text: "Who first proposed continental drift?", a: "Charles Darwin", b: "Alfred Wegener", c: "Isaac Newton", d: "Galileo Galilei", correct: "B", difficulty: "easy" as const, skill: "Plate Tectonics" },
      { text: "The asthenosphere is described as:", a: "Completely solid", b: "Partially molten", c: "Fully liquid", d: "Made of iron", correct: "B", difficulty: "easy" as const, skill: "Plate Tectonics" },
      { text: "Which is an example of a transform boundary?", a: "Mid-Atlantic Ridge", b: "Himalayas", c: "San Andreas Fault", d: "Mariana Trench", correct: "C", difficulty: "medium" as const, skill: "Plate Tectonics" },
      { text: "Evidence supporting plate tectonics includes:", a: "Paleomagnetism and seafloor spreading", b: "Only fossils", c: "Weather patterns", d: "Animal migration", correct: "A", difficulty: "medium" as const, skill: "Plate Tectonics" },
    ],
  },
  {
    title: "Rock Cycle",
    text: "The rock cycle describes the formation, breakdown, and reformation of rocks through geological processes. There are three main types of rocks: igneous, sedimentary, and metamorphic. Igneous rocks form when magma or lava cools and solidifies. Intrusive igneous rocks, like granite, form when magma cools slowly beneath Earth's surface, resulting in large crystals. Extrusive igneous rocks, like basalt, form when lava cools quickly at the surface, producing fine-grained or glassy textures. Sedimentary rocks form through the accumulation and compaction of sediments, which can include fragments of other rocks, mineral crystals, or organic material. Metamorphic rocks form when existing rocks are subjected to high heat, high pressure, or chemically active fluids, causing physical or chemical changes without melting. Weathering and erosion break down all rock types into sediments, while melting transforms any rock into magma, demonstrating the cyclical nature of this process.",
    questions: [
      { text: "Granite is an example of:", a: "Extrusive igneous rock", b: "Intrusive igneous rock", c: "Sedimentary rock", d: "Metamorphic rock", correct: "B", difficulty: "easy" as const, skill: "Rock Cycle" },
      { text: "Sedimentary rocks form through:", a: "Cooling of magma", b: "Accumulation and compaction of sediments", c: "High heat and pressure", d: "Volcanic eruption", correct: "B", difficulty: "easy" as const, skill: "Rock Cycle" },
      { text: "Metamorphic rocks form through:", a: "Cooling of lava only", b: "High heat, pressure, or chemically active fluids", c: "Sediment deposition", d: "Freezing of water", correct: "B", difficulty: "easy" as const, skill: "Rock Cycle" },
      { text: "Basalt has a fine-grained texture because:", a: "It cooled slowly underground", b: "It cooled quickly at the surface", c: "It was under high pressure", d: "It contains many minerals", correct: "B", difficulty: "medium" as const, skill: "Rock Cycle" },
      { text: "Weathering and erosion produce:", a: "Magma", b: "Sediments", c: "Crystals", d: "Metamorphic rocks", correct: "B", difficulty: "easy" as const, skill: "Rock Cycle" },
      { text: "The rock cycle demonstrates that:", a: "Rocks never change", b: "Rocks can transform between types", c: "Only sedimentary rocks can change", d: "Rocks are destroyed permanently", correct: "B", difficulty: "easy" as const, skill: "Rock Cycle" },
    ],
  },
  {
    title: "Earth's Atmosphere",
    text: "Earth's atmosphere is a layer of gases surrounding the planet, held in place by gravity. It is composed primarily of nitrogen (78%) and oxygen (21%), with trace amounts of argon, carbon dioxide, water vapor, and other gases. The atmosphere is divided into five layers based on temperature changes: the troposphere (where weather occurs, 0-12 km), the stratosphere (contains the ozone layer, 12-50 km), the mesosphere (50-80 km), the thermosphere (80-700 km, where auroras occur), and the exosphere (above 700 km, gradually fading into space). The ozone layer in the stratosphere absorbs harmful ultraviolet radiation from the sun, protecting life on Earth. The greenhouse effect, caused by gases like CO2 and methane trapping heat in the lower atmosphere, keeps Earth's average temperature at about 15°C. Human activities, particularly the burning of fossil fuels, have increased greenhouse gas concentrations, leading to global warming and climate change.",
    questions: [
      { text: "What is the primary component of Earth's atmosphere?", a: "Oxygen", b: "Carbon dioxide", c: "Nitrogen", d: "Hydrogen", correct: "C", difficulty: "easy" as const, skill: "Atmosphere" },
      { text: "The ozone layer is found in the:", a: "Troposphere", b: "Stratosphere", c: "Mesosphere", d: "Exosphere", correct: "B", difficulty: "easy" as const, skill: "Atmosphere" },
      { text: "The greenhouse effect keeps Earth's average temperature at about:", a: "0°C", b: "15°C", c: "30°C", d: "-15°C", correct: "B", difficulty: "easy" as const, skill: "Atmosphere" },
      { text: "Where do auroras occur?", a: "Troposphere", b: "Stratosphere", c: "Thermosphere", d: "Mesosphere", correct: "C", difficulty: "medium" as const, skill: "Atmosphere" },
      { text: "What percentage of the atmosphere is oxygen?", a: "21%", b: "78%", c: "1%", d: "50%", correct: "A", difficulty: "easy" as const, skill: "Atmosphere" },
      { text: "Increased greenhouse gas concentrations are primarily caused by:", a: "Solar flares", b: "Burning fossil fuels", c: "Ocean currents", d: "Volcanic activity", correct: "B", difficulty: "easy" as const, skill: "Atmosphere" },
    ],
  },
  {
    title: "Minerals and Their Properties",
    text: "A mineral is a naturally occurring, inorganic solid with a definite chemical composition and an ordered crystalline structure. Minerals are identified by their physical properties, which include hardness (resistance to scratching, measured on the Mohs scale from 1 to 10), luster (how light reflects from the surface, described as metallic or non-metallic), color, streak (the color of the powdered mineral), cleavage (the tendency to break along planes of weakness), and fracture (the pattern of breaking when not along cleavage planes). The most abundant minerals in Earth's crust are silicates, which contain silicon and oxygen. Quartz (SiO2) is one of the most common silicate minerals. Other important mineral groups include carbonates (like calcite), oxides (like hematite), and sulfides (like pyrite). Minerals form through various processes including crystallization from magma, precipitation from solution, and metamorphism of existing minerals under heat and pressure.",
    questions: [
      { text: "Hardness is measured on the:", a: "Richter scale", b: "Mohs scale", c: "Kelvin scale", d: "Celsius scale", correct: "B", difficulty: "easy" as const, skill: "Minerals" },
      { text: "The most abundant minerals in Earth's crust are:", a: "Carbonates", b: "Oxides", c: "Silicates", d: "Sulfides", correct: "C", difficulty: "easy" as const, skill: "Minerals" },
      { text: "Streak refers to:", a: "The color of the whole mineral", b: "The color of the powdered mineral", c: "The mineral's shape", d: "How the mineral breaks", correct: "B", difficulty: "easy" as const, skill: "Minerals" },
      { text: "Quartz is composed of:", a: "Calcium carbonate", b: "Silicon dioxide (SiO2)", c: "Iron oxide", d: "Sodium chloride", correct: "B", difficulty: "easy" as const, skill: "Minerals" },
      { text: "Luster describes:", a: "How heavy a mineral is", b: "How light reflects from the surface", c: "The mineral's hardness", d: "The mineral's age", correct: "B", difficulty: "easy" as const, skill: "Minerals" },
    ],
  },
];

// Chemistry passages and questions
const chemistryPassages = [
  {
    title: "Atomic Structure",
    text: "The atom is the basic unit of matter, consisting of a nucleus surrounded by electrons. The nucleus contains protons (positively charged) and neutrons (neutral), which together account for nearly all of the atom's mass. Electrons (negatively charged) orbit the nucleus in discrete energy levels or shells. The atomic number of an element equals the number of protons in its nucleus, determining its chemical identity. The mass number is the sum of protons and neutrons. Isotopes are atoms of the same element with different numbers of neutrons. The electron configuration of an atom determines its chemical behavior and bonding capacity. According to the quantum mechanical model, electrons exist in orbitals—regions of probability where they can be found. The periodic table organizes elements by increasing atomic number and groups elements with similar chemical properties into columns.",
    questions: [
      { text: "What determines an element's chemical identity?", a: "Number of neutrons", b: "Number of protons", c: "Number of electrons", d: "Atomic mass", correct: "B", difficulty: "easy" as const, skill: "Atomic Structure" },
      { text: "Neutrons have what charge?", a: "Positive", b: "Negative", c: "Neutral", d: "Variable", correct: "C", difficulty: "easy" as const, skill: "Atomic Structure" },
      { text: "Isotopes differ in their number of:", a: "Protons", b: "Electrons", c: "Neutrons", d: "Shells", correct: "C", difficulty: "easy" as const, skill: "Atomic Structure" },
      { text: "The mass number equals:", a: "Number of protons only", b: "Number of electrons", c: "Protons plus neutrons", d: "Atomic number", correct: "C", difficulty: "easy" as const, skill: "Atomic Structure" },
      { text: "The periodic table organizes elements by:", a: "Alphabetical order", b: "Increasing atomic number", c: "Color", d: "State at room temperature", correct: "B", difficulty: "easy" as const, skill: "Atomic Structure" },
    ],
  },
  {
    title: "Chemical Bonding",
    text: "Chemical bonds are the forces that hold atoms together in compounds. There are three main types of chemical bonds: ionic, covalent, and metallic. Ionic bonds form when electrons are transferred from one atom to another, creating positively and negatively charged ions that attract each other. This typically occurs between metals and nonmetals. Covalent bonds form when atoms share electrons, usually between nonmetal atoms. Covalent bonds can be single (one shared pair), double (two shared pairs), or triple (three shared pairs). Polar covalent bonds occur when electrons are shared unequally due to differences in electronegativity. Metallic bonds involve a 'sea' of delocalized electrons shared among positively charged metal ions, giving metals their characteristic properties of conductivity and malleability. The type of bonding affects a compound's physical and chemical properties, including melting point, solubility, and electrical conductivity.",
    questions: [
      { text: "Ionic bonds form through:", a: "Electron sharing", b: "Electron transfer", c: "Proton exchange", d: "Neutron sharing", correct: "B", difficulty: "easy" as const, skill: "Chemical Bonding" },
      { text: "Covalent bonds typically form between:", a: "Metals", b: "Metals and nonmetals", c: "Nonmetal atoms", d: "Noble gases", correct: "C", difficulty: "easy" as const, skill: "Chemical Bonding" },
      { text: "In metallic bonds, electrons are:", a: "Transferred", b: "Shared between two atoms", c: "Delocalized in a sea", d: "Removed completely", correct: "C", difficulty: "medium" as const, skill: "Chemical Bonding" },
      { text: "A double covalent bond involves:", a: "One shared pair", b: "Two shared pairs", c: "Three shared pairs", d: "No shared pairs", correct: "B", difficulty: "easy" as const, skill: "Chemical Bonding" },
      { text: "Polar covalent bonds result from:", a: "Equal electron sharing", b: "Unequal electron sharing", c: "Electron transfer", d: "No electron interaction", correct: "B", difficulty: "medium" as const, skill: "Chemical Bonding" },
    ],
  },
  {
    title: "Acids, Bases, and pH",
    text: "Acids and bases are fundamental categories of chemical substances defined by the Arrhenius, Brønsted-Lowry, and Lewis theories. According to the Brønsted-Lowry theory, an acid is a proton (H+) donor, while a base is a proton acceptor. The pH scale measures the acidity or basicity of a solution, ranging from 0 (most acidic) to 14 (most basic), with 7 being neutral. pH is defined as the negative logarithm of the hydrogen ion concentration: pH = -log[H+]. Strong acids, such as hydrochloric acid (HCl) and sulfuric acid (H2SO4), completely dissociate in water, while weak acids only partially dissociate. Similarly, strong bases like sodium hydroxide (NaOH) completely dissociate, while weak bases like ammonia (NH3) only partially accept protons. When acids and bases react, they undergo neutralization, producing salt and water. Buffer solutions resist pH changes by containing a weak acid and its conjugate base, playing crucial roles in biological systems where maintaining stable pH is essential.",
    questions: [
      { text: "A Brønsted-Lowry acid is a:", a: "Proton acceptor", b: "Proton donor", c: "Electron donor", d: "Neutron acceptor", correct: "B", difficulty: "easy" as const, skill: "Acids and Bases" },
      { text: "A neutral pH is:", a: "0", b: "7", c: "14", d: "1", correct: "B", difficulty: "easy" as const, skill: "Acids and Bases" },
      { text: "Strong acids completely:", a: "Evaporate", b: "Dissociate in water", c: "Freeze", d: "Change color", correct: "B", difficulty: "easy" as const, skill: "Acids and Bases" },
      { text: "Neutralization produces:", a: "Only acid", b: "Salt and water", c: "Only base", d: "Carbon dioxide", correct: "B", difficulty: "easy" as const, skill: "Acids and Bases" },
      { text: "Buffers resist:", a: "Temperature changes", b: "pH changes", c: "Color changes", d: "Pressure changes", correct: "B", difficulty: "easy" as const, skill: "Acids and Bases" },
    ],
  },
  {
    title: "Chemical Reactions and Stoichiometry",
    text: "A chemical reaction is a process in which substances (reactants) are converted into different substances (products). Chemical reactions involve the breaking and forming of chemical bonds, with atoms rearranging but neither created nor destroyed, following the law of conservation of mass. Chemical equations represent reactions using formulas and coefficients to show the reactants and products. Balancing chemical equations ensures that the same number of each type of atom appears on both sides. Stoichiometry is the quantitative study of reactants and products in chemical reactions, using mole ratios derived from balanced equations. The limiting reactant is the reactant that is completely consumed first, determining the maximum amount of product that can form. Reaction rates can be affected by temperature, concentration, surface area, and the presence of catalysts—substances that speed up reactions without being consumed. Common reaction types include synthesis, decomposition, single replacement, double replacement, and combustion.",
    questions: [
      { text: "The law of conservation of mass states that:", a: "Mass is created in reactions", b: "Mass is neither created nor destroyed", c: "Mass disappears", d: "Only energy is conserved", correct: "B", difficulty: "easy" as const, skill: "Stoichiometry" },
      { text: "Stoichiometry is the study of:", a: "Reaction speeds", b: "Quantitative relationships in reactions", c: "Atomic structure", d: "Electron configurations", correct: "B", difficulty: "easy" as const, skill: "Stoichiometry" },
      { text: "The limiting reactant:", a: "Is always in excess", b: "Is completely consumed first", c: "Does not affect product amount", d: "Speeds up the reaction", correct: "B", difficulty: "easy" as const, skill: "Stoichiometry" },
      { text: "Catalysts:", a: "Are consumed in reactions", b: "Speed up reactions without being consumed", c: "Slow down reactions", d: "Change the products", correct: "B", difficulty: "easy" as const, skill: "Stoichiometry" },
      { text: "Balancing equations ensures:", a: "Same number of atoms on both sides", b: "Same number of molecules", c: "Equal energy", d: "Equal volume", correct: "A", difficulty: "easy" as const, skill: "Stoichiometry" },
    ],
  },
  {
    title: "Organic Chemistry Basics",
    text: "Organic chemistry is the study of carbon-containing compounds. Carbon's ability to form four stable covalent bonds allows it to create an enormous variety of compounds with diverse structures and functions. Hydrocarbons, the simplest organic compounds, contain only carbon and hydrogen. They are classified as alkanes (single bonds, saturated), alkenes (containing carbon-carbon double bonds), and alkynes (containing carbon-carbon triple bonds). Functional groups are specific groups of atoms within molecules that determine their chemical properties. Important functional groups include hydroxyl (-OH) in alcohols, carbonyl (C=O) in aldehydes and ketones, carboxyl (-COOH) in carboxylic acids, and amino (-NH2) in amines. Organic compounds are essential to life, forming the basis of biomolecules: carbohydrates (energy storage), lipids (membranes and energy), proteins (enzymes and structure), and nucleic acids (genetic information). Polymers are large molecules composed of repeating monomer units, including natural polymers like DNA and synthetic polymers like plastics.",
    questions: [
      { text: "Organic chemistry studies compounds containing:", a: "Oxygen", b: "Nitrogen", c: "Carbon", d: "Hydrogen only", correct: "C", difficulty: "easy" as const, skill: "Organic Chemistry" },
      { text: "Alkanes contain:", a: "Double bonds", b: "Triple bonds", c: "Only single bonds", d: "Ionic bonds", correct: "C", difficulty: "easy" as const, skill: "Organic Chemistry" },
      { text: "The hydroxyl functional group is represented as:", a: "-COOH", b: "-OH", c: "-NH2", d: "C=O", correct: "B", difficulty: "easy" as const, skill: "Organic Chemistry" },
      { text: "Proteins function as:", a: "Only energy storage", b: "Enzymes and structural components", c: "Genetic material only", d: "Membrane lipids", correct: "B", difficulty: "easy" as const, skill: "Organic Chemistry" },
      { text: "Polymers are composed of:", a: "Single atoms", b: "Repeating monomer units", c: "Only metals", d: "Noble gases", correct: "B", difficulty: "easy" as const, skill: "Organic Chemistry" },
    ],
  },
];

// Physics passages and questions
const physicsPassages = [
  {
    title: "Newton's Laws of Motion",
    text: "Sir Isaac Newton formulated three fundamental laws of motion that describe the relationship between a body and the forces acting upon it. The First Law, also known as the Law of Inertia, states that an object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force. The Second Law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass, expressed as F = ma. The Third Law states that for every action, there is an equal and opposite reaction—when one object exerts a force on a second object, the second object exerts an equal and opposite force on the first. These laws form the foundation of classical mechanics and are applicable to most everyday situations, though they break down at very small scales (where quantum mechanics applies) and very high speeds (where relativity applies).",
    questions: [
      { text: "Newton's First Law is also called:", a: "Law of Gravity", b: "Law of Inertia", c: "Law of Acceleration", d: "Law of Reaction", correct: "B", difficulty: "easy" as const, skill: "Mechanics" },
      { text: "Newton's Second Law is expressed as:", a: "E = mc²", b: "F = ma", c: "V = IR", d: "P = mv", correct: "B", difficulty: "easy" as const, skill: "Mechanics" },
      { text: "The Third Law states forces are:", a: "Unequal", b: "Equal and opposite", c: "Only attractive", d: "Only repulsive", correct: "B", difficulty: "easy" as const, skill: "Mechanics" },
      { text: "Acceleration is inversely proportional to:", a: "Force", b: "Mass", c: "Velocity", d: "Time", correct: "B", difficulty: "easy" as const, skill: "Mechanics" },
      { text: "Newton's laws break down at:", a: "Everyday speeds only", b: "Very small scales and very high speeds", c: "Only high temperatures", d: "Only low pressures", correct: "B", difficulty: "medium" as const, skill: "Mechanics" },
    ],
  },
  {
    title: "Electricity and Magnetism",
    text: "Electricity and magnetism are interconnected phenomena described by Maxwell's equations. Electric charge is a fundamental property of matter, with two types: positive and negative. Like charges repel, while opposite charges attract. Electric current is the flow of electric charge, typically carried by electrons in a conductor. Voltage (potential difference) is the driving force that pushes current through a circuit, while resistance opposes this flow. Ohm's Law states that V = IR, where V is voltage, I is current, and R is resistance. Electric power is calculated as P = VI. Magnetism arises from the motion of electric charges. A magnetic field is created around any current-carrying wire. Electromagnets, created by wrapping wire around a ferromagnetic core, are used in devices ranging from electric motors to MRI machines. Electromagnetic induction, discovered by Michael Faraday, describes how a changing magnetic field can induce an electric current in a nearby conductor, forming the basis of electrical generators and transformers.",
    questions: [
      { text: "Ohm's Law states:", a: "V = IR", b: "F = ma", c: "E = mc²", d: "P = mv", correct: "A", difficulty: "easy" as const, skill: "Electricity" },
      { text: "Opposite charges:", a: "Repel", b: "Attract", c: "Have no effect", d: "Cancel out", correct: "B", difficulty: "easy" as const, skill: "Electricity" },
      { text: "Electric current is the flow of:", a: "Magnetic fields", b: "Electric charge", c: "Heat energy", d: "Light", correct: "B", difficulty: "easy" as const, skill: "Electricity" },
      { text: "Electromagnetic induction was discovered by:", a: "Isaac Newton", b: "Michael Faraday", c: "Albert Einstein", d: "Thomas Edison", correct: "B", difficulty: "easy" as const, skill: "Electricity" },
      { text: "Electromagnets are used in:", a: "Only compasses", b: "Electric motors and MRI machines", c: "Only batteries", d: "Solar panels only", correct: "B", difficulty: "easy" as const, skill: "Electricity" },
    ],
  },
  {
    title: "Waves and Sound",
    text: "A wave is a disturbance that transfers energy through a medium or space. Waves can be classified as mechanical waves (requiring a medium, such as sound and water waves) or electromagnetic waves (can travel through vacuum, such as light). Wave properties include wavelength (distance between consecutive crests), frequency (number of waves per second, measured in Hertz), amplitude (maximum displacement from equilibrium), and speed. The wave equation relates these properties: v = fλ, where v is wave speed, f is frequency, and λ is wavelength. Sound is a longitudinal mechanical wave that travels through a medium by compressing and rarefying particles. The speed of sound in air at room temperature is approximately 343 meters per second. Pitch corresponds to frequency, while loudness corresponds to amplitude. The Doppler effect describes the change in frequency of a wave in relation to an observer moving relative to the wave source, explaining why a siren sounds higher-pitched as it approaches and lower-pitched as it recedes.",
    questions: [
      { text: "The wave equation is:", a: "E = mc²", b: "v = fλ", c: "F = ma", d: "P = VI", correct: "B", difficulty: "easy" as const, skill: "Waves" },
      { text: "Sound is a:", a: "Transverse electromagnetic wave", b: "Longitudinal mechanical wave", c: "Transverse mechanical wave", d: "Standing wave only", correct: "B", difficulty: "easy" as const, skill: "Waves" },
      { text: "Frequency is measured in:", a: "Meters", b: "Seconds", c: "Hertz", d: "Joules", correct: "C", difficulty: "easy" as const, skill: "Waves" },
      { text: "Pitch corresponds to:", a: "Amplitude", b: "Frequency", c: "Wavelength", d: "Speed", correct: "B", difficulty: "easy" as const, skill: "Waves" },
      { text: "The Doppler effect explains:", a: "Wave reflection", b: "Frequency change due to relative motion", c: "Wave refraction", d: "Sound cancellation", correct: "B", difficulty: "medium" as const, skill: "Waves" },
    ],
  },
  {
    title: "Thermodynamics",
    text: "Thermodynamics is the branch of physics concerned with heat and its relationship to other forms of energy. The First Law of Thermodynamics states that energy cannot be created or destroyed, only transferred or converted from one form to another, essentially a statement of conservation of energy. The Second Law states that in any energy transfer, the total entropy (disorder) of a closed system always increases over time. Heat always flows spontaneously from hotter objects to colder objects, never the reverse. Temperature is a measure of the average kinetic energy of particles in a substance. The three main methods of heat transfer are conduction (through direct contact), convection (through fluid movement), and radiation (through electromagnetic waves). Specific heat capacity is the amount of heat required to raise the temperature of a unit mass of a substance by one degree. Phase changes (solid to liquid, liquid to gas) occur at constant temperature while energy is absorbed or released as latent heat.",
    questions: [
      { text: "The First Law of Thermodynamics is about:", a: "Entropy increase", b: "Conservation of energy", c: "Heat flow direction", d: "Phase changes", correct: "B", difficulty: "easy" as const, skill: "Thermodynamics" },
      { text: "The Second Law states that entropy:", a: "Decreases", b: "Stays constant", c: "Increases", d: "Becomes zero", correct: "C", difficulty: "easy" as const, skill: "Thermodynamics" },
      { text: "Heat flows spontaneously from:", a: "Cold to hot", b: "Hot to cold", c: "Only solids", d: "Only liquids", correct: "B", difficulty: "easy" as const, skill: "Thermodynamics" },
      { text: "Temperature measures:", a: "Total energy", b: "Average kinetic energy", c: "Potential energy", d: "Heat capacity", correct: "B", difficulty: "easy" as const, skill: "Thermodynamics" },
      { text: "Convection transfers heat through:", a: "Direct contact", b: "Fluid movement", c: "Electromagnetic waves", d: "Molecular vibration only", correct: "B", difficulty: "easy" as const, skill: "Thermodynamics" },
    ],
  },
  {
    title: "Optics and Light",
    text: "Optics is the study of light and its interactions with matter. Light exhibits both wave-like and particle-like properties, a concept known as wave-particle duality. When light travels from one medium to another, it undergoes refraction (bending) according to Snell's Law: n1sin(θ1) = n2sin(θ2), where n is the refractive index. The refractive index measures how much a medium slows down light compared to vacuum. Reflection occurs when light bounces off a surface, with the angle of incidence equaling the angle of reflection. Lenses use refraction to focus or diverge light. Convex (converging) lenses bring parallel rays to a focal point, while concave (diverging) lenses spread them apart. The human eye uses a convex lens (the cornea and lens) to focus light onto the retina. Color arises from the different wavelengths of visible light, ranging from approximately 400 nm (violet) to 700 nm (red). Dispersion, as seen in rainbows, occurs when white light is separated into its component colors by a prism.",
    questions: [
      { text: "Refraction is described by:", a: "Ohm's Law", b: "Snell's Law", c: "Newton's Law", d: "Boyle's Law", correct: "B", difficulty: "easy" as const, skill: "Optics" },
      { text: "Convex lenses:", a: "Diverge light", b: "Converge light", c: "Absorb light", d: "Reflect light", correct: "B", difficulty: "easy" as const, skill: "Optics" },
      { text: "The angle of incidence equals:", a: "The refractive index", b: "The angle of reflection", c: "90 degrees", d: "Zero degrees", correct: "B", difficulty: "easy" as const, skill: "Optics" },
      { text: "Visible light ranges from approximately:", a: "100-200 nm", b: "400-700 nm", c: "1000-2000 nm", d: "1-10 nm", correct: "B", difficulty: "easy" as const, skill: "Optics" },
      { text: "Dispersion separates white light into:", a: "Only two colors", b: "Its component colors", c: "Invisible radiation", d: "Heat energy", correct: "B", difficulty: "easy" as const, skill: "Optics" },
    ],
  },
];

async function seed() {
  console.log("Seeding database with URT questions...");

  // Insert English questions
  let qNum = 1;
  for (const passage of englishPassages) {
    for (const q of passage.questions) {
      await db.insert(questions).values({
        subject: "english",
        passageTitle: passage.title,
        passageText: passage.text,
        passageNumber: englishPassages.indexOf(passage) + 1,
        questionText: q.text,
        optionA: q.a,
        optionB: q.b,
        optionC: q.c,
        optionD: q.d,
        correctAnswer: q.correct,
        difficulty: q.difficulty,
        skillTag: q.skill,
        explanation: `The correct answer is ${q.correct}. ${q.text}`,
      });
      qNum++;
    }
  }
  console.log(`Inserted ${qNum - 1} English questions`);

  // Insert Biology questions
  for (const passage of biologyPassages) {
    for (const q of passage.questions) {
      await db.insert(questions).values({
        subject: "biology",
        passageTitle: passage.title,
        passageText: passage.text,
        passageNumber: biologyPassages.indexOf(passage) + 1,
        questionText: q.text,
        optionA: q.a,
        optionB: q.b,
        optionC: q.c,
        optionD: q.d,
        correctAnswer: q.correct,
        difficulty: q.difficulty,
        skillTag: q.skill,
        explanation: `The correct answer is ${q.correct}.`,
      });
    }
  }
  console.log(`Inserted ${biologyPassages.length * 5} Biology questions`);

  // Insert Geology questions
  for (const passage of geologyPassages) {
    for (const q of passage.questions) {
      await db.insert(questions).values({
        subject: "geology",
        passageTitle: passage.title,
        passageText: passage.text,
        passageNumber: geologyPassages.indexOf(passage) + 1,
        questionText: q.text,
        optionA: q.a,
        optionB: q.b,
        optionC: q.c,
        optionD: q.d,
        correctAnswer: q.correct,
        difficulty: q.difficulty,
        skillTag: q.skill,
        explanation: `The correct answer is ${q.correct}.`,
      });
    }
  }
  console.log(`Inserted ${geologyPassages.reduce((acc, p) => acc + p.questions.length, 0)} Geology questions`);

  // Insert Chemistry questions
  for (const passage of chemistryPassages) {
    for (const q of passage.questions) {
      await db.insert(questions).values({
        subject: "chemistry",
        passageTitle: passage.title,
        passageText: passage.text,
        passageNumber: chemistryPassages.indexOf(passage) + 1,
        questionText: q.text,
        optionA: q.a,
        optionB: q.b,
        optionC: q.c,
        optionD: q.d,
        correctAnswer: q.correct,
        difficulty: q.difficulty,
        skillTag: q.skill,
        explanation: `The correct answer is ${q.correct}.`,
      });
    }
  }
  console.log(`Inserted ${chemistryPassages.length * 5} Chemistry questions`);

  // Insert Physics questions
  for (const passage of physicsPassages) {
    for (const q of passage.questions) {
      await db.insert(questions).values({
        subject: "physics",
        passageTitle: passage.title,
        passageText: passage.text,
        passageNumber: physicsPassages.indexOf(passage) + 1,
        questionText: q.text,
        optionA: q.a,
        optionB: q.b,
        optionC: q.c,
        optionD: q.d,
        correctAnswer: q.correct,
        difficulty: q.difficulty,
        skillTag: q.skill,
        explanation: `The correct answer is ${q.correct}.`,
        
      });
    }
  }
  console.log(`Inserted ${physicsPassages.length * 5} Physics questions`);

  console.log("Seeding complete!");
}

seed().catch(console.error);
