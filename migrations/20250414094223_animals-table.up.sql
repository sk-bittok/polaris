-- Add up migration script here

-- Livestock categories
CREATE TABLE species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(name)
);

INSERT INTO species (name, description) VALUES
('cattle', 'Beef and dairy cattle'),
('sheep', 'All sheep breeds'),
('goats', 'All goat breeds'),
('pigs', 'All pig breeds'),
('chicken', 'Broilers and layers domestic fowls');

-- Breeds table
CREATE TABLE breeds (
    id SERIAL PRIMARY KEY,
    specie_id INTEGER NOT NULL REFERENCES species(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    typical_male_weight_range VARCHAR(50),
    typical_female_weight_range VARCHAR(50),
    typical_gestation_period VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_system_defined BOOLEAN DEFAULT FALSE,
    organisation_pid UUID REFERENCES organisations (pid) ON DELETE CASCADE,
    UNIQUE(specie_id, name),
    CONSTRAINT validate_breed_ownership CHECK (
            (is_system_defined = TRUE AND organisation_pid IS NULL) OR
            (is_system_defined = FALSE AND organisation_pid IS NOT NULL))
);


CREATE TRIGGER update_breeds_timestamp BEFORE UPDATE ON breeds
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- Prepopulate the breeds table with popular breeds
INSERT INTO breeds (specie_id, name, description, typical_male_weight_range, typical_female_weight_range, typical_gestation_period, is_system_defined) VALUES
        (1, 'Aberdeen Angus', 'Aberdeen Angus cattle are naturally polled and can be black or red in colour although black is the dominant colour, white may occasionally appear on the udder. They are resistant to harsh weather, undemanding, adaptable, good natured, mature extremely early and have a high carcass yield with nicely marbled meat. Angus are renowned as a carcass breed. They are used widely in crossbreeding to improve carcass quality and milking ability. Angus females calve easily and have good calf rearing ability. They are also used as a genetic dehorner as the polled gene is passed on as a dominant characteristic.', '750-950 kg', '500-550 kg', '283 days', TRUE),
        (1, 'Hereford', 'The modern Hereford is coloured dark red to red-yellow, with a white face, crest, dewlap, and underline. Herefords with white flanks and white markings below the knees and hocks are also common. Most animals have short thick horns that typically curve down at the sides of the head, but there is a polled strain in North America and UK (Polled Hereford). Mature males may weigh up to 1000 kg, while mature females may weigh around 600 kg. They are muscular, moderate to long in length of side, adequate in length of leg, large in size, trim, and smooth. They are also well developed in the regions of valuable cuts - the back, loin, and hind quarters or round. These cattle are known for their vigor and foraging ability and for their longevity, many females live and produce calves beyond the age of 15 years. Bulls are capable of remaining profitable at stud to the age of 12 or more. Many breeders keep their elderly cattle until they die of natural causes. Herefords will stand out in the arctic snows of Finland, endure the heat of Northern Transvaal, withstand the tough climate and rough grazing of northern Uruguay or the sub-tropical zones of Brazil and continue to thrive. Herefords are generally docile and fast growing cattle with good beef quality.', '1000-1045 kg', '545-680 kg', '285 days', TRUE),
        (1, 'Beef Shorthorn', 'Beef Shorthorn come in three colours, red, white and roan. Red cattle may be solid red or have white markings and they can be horned or polled. They are bigger than their dairy counterparts and are grown specifically for their beef. Solid red Shorthorn are often used to help maintain solid colors in crosses. The whites and roans can be used on black cattle to get both blues and blacks. Shorthorn bulls are active aggressive breeders and we get many reports of bulls being used in commercial herds for several years, often up to eight years. An advantage of the Shorthorn cross is that the steers produced have an excellent rate of gain, good feed conversion and increased marbling and tenderness. Overall the Shorthorn is the ideal breed for the production of a choice high quality beef with its suitability for extensive and organic farming systems and its proven marbling and early finishing abilities.', '1100-1300 kg', '600-800 kg', '284 days', TRUE ),
        (1, 'Friesian', 'The Friesian can be one of two coat colour types, white with black patches (the common colour) or white with red patches. They are very similar in size and confirmation to the Holstein. The Friesian is a renowned dairy breed with some outstanding examples of the breed having 12 to 15 lactations to their credit, emphasising their inherent natural fecundity. In response to demand, protein percentages have been raised across the breed and herd protein levels of 3.4% to 3.5% are not uncommon. One of the great strengths of the British Friesian is the ability of the male calf to finish and grade satisfactorily, either in intensive systems, or as steers, extensively.', '1000-1200 kg', '580-750 kg', '279 days', TRUE ),
        (1, 'Boran', 'The Boran is medium in size with a short head, small ears, loose dewlap and a large hump above the shoulders. They can be horned or polled. They vary in height from 114cm to 147cm tall, and in weight bulls weigh approximately 500kg to 850kg. Cows weigh about 380kg to 450kg Their skin is loose, thick and extremely pliable for added insect repellence plus it is dark pigmented with fine short hair for heat tolerance. Hair colour can be a range of colours except brindle or solid black. The Boran male and female share breed points, the sexes, however, show marked dimorphism - the female being notably small, whilst the male grows to a large size. The cow has a well-carried udder with strong attachments and neat, small teats, in contrast to some Asian Zebu breeds. Boran heifers reach puberty at an average age of 385 days. She is an excellent mother, not only will she feed her calf so well that high weaning weights are attainable, but she guards against predators, and will never allow her calf to get lost in the bush. Calving problems hardly exist. Calves at birth weigh an average of 28 kg for males and females, 25 kg. Boran cattle have developed adaptive traits of crucial importance for their survival. Some of these characters are - the ability to withstand periodic shortage of water and feed, ability to walk long distances in search of water and feed and ability to digest low quality feeds. The herd instinct of the Boran makes it easy to manage and survive in bush country. They will always stay together and can graze on the trot. The well-developed beef conformation shows up in carcase appraisals. The depth of eye muscle, marbling, even fat cover and ratio of hind to forequarter make the Boran difficult to beat, hence the preference of Kenya butchers for young, well-finished Boran steers.', '700-900 kg', '450-585 kg', '285 days', TRUE),
        (1, 'Sahiwal', 'Their colour can range from reddish brown through to the more predominant red, with varying amounts of white on the neck, and the underline. In males the colour darkens towards the extremities, such as the head, legs and tail. It is tick-resistant, heat-tolerant and noted for its high resistance to parasites, both internal and external. Cows average 2270kg of milk during a lactation while suckling a calf and much higher milk yields have been recorded. They are generally docile and lethargic, making them more useful for slow work. The Sahiwal is the heaviest milker of all Zebu breeds and display a well developed udder. Sahiwals demonstrate the ability to sire small, fast-growing calves and are noted for their hardiness under unfavorable climatic conditions.', '650-850 kg','350-550 kg', '289 days', TRUE),

        -- Sheep category
        (2, 'Dorper', 'Mutton sheep with black head and white coat', '50-80', '90-140', '147 days', TRUE),
        (2, 'Dorset Horn', 'White mutton sheep from England', '60-75', '90-120', '145 days', TRUE),
        (2, 'Merino', 'Wool sheep', '30-60', '70-80', '144 days', TRUE);

-- Main livestock table
CREATE TABLE animals (
    id SERIAL PRIMARY KEY,
    pid UUID NOT NULL UNIQUE DEFAULT (uuid_generate_v4()),
    organisation_pid UUID NOT NULL REFERENCES organisations (pid) ON DELETE CASCADE,
    tag_id VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    specie_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    breed_id INTEGER  NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    parent_female_id UUID REFERENCES animals (pid),
    parent_male_id UUID REFERENCES animals (pid),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'transferred')),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    weight_at_birth DECIMAL(6, 2),
    current_weight DECIMAL(6, 2),
    notes TEXT,
    created_by UUID REFERENCES users (pid),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(organisation_pid, tag_id)
);

CREATE INDEX animals_org_idx ON animals (organisation_pid);
CREATE INDEX animals_tag_idx ON animals (tag_id);
CREATE INDEX animals_status_idx ON animals (status);

CREATE TRIGGER update_animals_timestamp BEFORE UPDATE ON animals
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Audit trigger for users table
-- CREATE TRIGGER audit_animals_trigger
-- AFTER INSERT OR UPDATE OR DELETE ON animals
-- FOR EACH ROW EXECUTE FUNCTION process_audit()
