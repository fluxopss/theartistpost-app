// Ported from theartistpost@03f9a2f:src/content/site.ts
/**
 * Canonical site content pulled from https://theartistpost.org/
 * Keep marketing copy here — not a CMS in v1.
 *
 * Native notes: web-only nav (navMarketing, appTabs, moreMenu) and PWA/install
 * copy were dropped; native navigation is defined in the router. Web asset
 * paths became `BrandImage` keys + `remoteImagePath`.
 */

export const site = {
  name: "The Artist Post",
  mark: "The Artist Post®",
  legalName: "The Artist Post INC",
  nonprofitLine: "The Artist Post Inc. is a Nonprofit 501(c)(3) Organization.",
  ein: "85-2609788",
  venmo: "@theartistpost",
  kindnessMark: "Kindness Always®",
  shine: "BE KIND, SHINE BRIGHT!",
  tagline:
    "The Artist Post® connects artists, small businesses, and communities by providing free opportunities for local creatives to showcase, sell, and grow through kindness and collaboration.",
  headline: "Get Involved",
  heroSupport:
    "Free opportunities for local creatives to showcase, sell, and grow through kindness and collaboration.",
  metaDescription:
    "The Artist Post® connects artists, small businesses, and communities through free showcase space, kindness, and collaboration in West Palm Beach.",
  aboutMetaDescription:
    "Support local artists through our community-driven platform, dedicated to arts and culture advocacy.",
  twitterHandle: "@TheArtistPost",
  email: "Robbie@theartistpost.org",
  phone: "832-833-9100",
  phoneTel: "8328339100",
  address: {
    line1: "522 Clematis Street",
    city: "West Palm Beach",
    state: "FL",
    country: "USA",
    full: "522 Clematis Street, West Palm Beach, FL, USA",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=522+Clematis+Street+West+Palm+Beach+FL",
  hoursToday: "09:00 am – 09:30 pm",
  /** Structured house hours (minutes after local midnight in `timeZone`). */
  hours: {
    openMinutes: 540, // 09:00
    closeMinutes: 1290, // 21:30
    label: "9:00 AM – 9:30 PM",
    timeZone: "America/New_York",
  },
  copyright: "Copyright © 2026 The Artist Post Inc - All Rights Reserved.",
  founded: "2014",
  foundedMonth: "2014-12",
  founder: "Robbie Alvarez",
} as const;

export const links = {
  donate:
    "https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=3DCYEFGX7GXMY",
  merch: "https://www.bonfire.com/love-all-51/",
  artistAgreement: "https://forms.gle/uS58nk2Bpgx45Uwv5",
  partnerSubCulture: "https://sub-culture.org/",
  social: {
    facebook: "https://www.facebook.com/TheArtistPost",
    instagram: "https://www.instagram.com/the_artist_post",
    linkedin: "https://www.linkedin.com/company/the-artist-post",
    pinterest: "https://www.pinterest.com/theartistpost/",
    tiktok: "https://www.tiktok.com/@the_artist_post",
    x: "https://www.x.com/TheArtistPost",
    youtube: "https://www.youtube.com/channel/UC7xnl70dDRjEg6bJt-W1FXw",
  },
} as const;

/** Brand images the app knows by key. Bundled sources live outside content. */
export type BrandImage =
  | "logo"
  | "logo3d"
  | "cover"
  | "hacienda"
  | "haciendaHero"
  | "comingSoon"
  | "aboutHero"
  | "kindnessTrademark"
  | "loveAll"
  | "supportersMap"
  | "donations"
  | "merchLockup"
  | "merch1"
  | "merch2"
  | "merch3"
  | "partnerSubCulture";

/** Path of each brand image on the web origin (for remote fallback / sharing). */
export const remoteImagePath: Record<BrandImage, string> = {
  logo: "/brand/logo.webp",
  logo3d: "/brand/logo-3d.webp",
  cover: "/brand/cover-opt.webp",
  hacienda: "/brand/hacienda.webp",
  haciendaHero: "/brand/hacienda-hero.webp",
  comingSoon: "/brand/coming-soon.webp",
  aboutHero: "/brand/about-hero.webp",
  kindnessTrademark: "/brand/kindness-trademark.webp",
  loveAll: "/brand/love-all.webp",
  supportersMap: "/brand/supporters-map.webp",
  donations: "/brand/donations-appreciated.webp",
  merchLockup: "/merch/tap-merch-site.webp",
  merch1: "/merch/img-1605.webp",
  merch2: "/merch/img-5690.webp",
  merch3: "/merch/gallery.webp",
  partnerSubCulture: "/brand/partner-subculture.webp",
};

/** Merch photos in the order the web used (`assets.merchPhotos`). */
export const merchPhotos: readonly BrandImage[] = ["merch1", "merch2", "merch3"];

/** Official TAP mantra from client trademark sheet. */
export const mantra = [
  { lead: "Love", rest: "ALL" },
  { lead: "Dream", rest: "TOGETHER" },
  { lead: "Create", rest: "AS ONE", mark: "™" },
] as const;

export const appCopy = {
  studioKicker: "Your studio",
  studioTitle: "TAP, in your pocket",
  studioLead:
    "The 2016 TAP app put musicians, photographers, dancers, filmmakers, actors, comedians, and models on one stage. This is that stage — photographs, video, and sound — with a live room on Clematis.",
  guestLine: "Browse as a guest — join to respond on the Wall.",
  sessionMemberLine: "Member pass active on this device.",
  sessionArtistLine: "Studio session open — publish waits on approval.",
  comingNextTitle: "Designed next",
  comingNext: [
    {
      title: "Email-code sign-in",
      body: "Email-code sign-in so your studio follows you across devices.",
    },
    {
      title: "Live Hacienda lineup",
      body: "Real portraits and confirmed nights land here the moment Robbie provides them — we will not invent artists.",
    },
    {
      title: "Night reminders",
      body: "Quiet reminders before a night you are holding a seat for.",
    },
  ],
} as const;

export const copy = {
  involve: {
    kicker: "Participation first",
    title: "Get Involved",
    lead: "The first move is not a purchase — it is showing up. Choose the door that fits you.",
    shine: site.shine,
    formTitle: "Tell us how you want to show up",
    formBody:
      "Robbie reads these. No account required. We will follow up about space, partnership, or volunteering.",
    success:
      "Received — thank you. If you booked space, keep the agreement tab open and we will send a scheduling link after approval.",
    spaceAgreement: "Review & sign the artist agreement",
    spaceAfter:
      "After the signed agreement is approved, you receive a scheduling link.",
  },
  house: {
    kicker: "Five doors. One house for art.",
    headline: "Creativity needs kindness",
    hub: "Arts & Entertainment Hub",
    exploreLine:
      "Explore the latest in local arts, music, theater, and culture.",
    floorLine: "Love ALL. Dream TOGETHER. Create AS ONE.",
    ctaInvolve: "Get Involved",
    ctaKindness: "Leave a Kindness",
    wallCta: "Explore the Wall",
    wallHint:
      "Explore the latest in local arts, music, theater, and culture.",
    enter: "Step through",
  },
  night: {
    kicker: "The next night",
    hold: "Hold a seat",
    admit: "Admit one",
    lineup:
      "Artist names stay off this card until they are approved. The room, the kindness, and the merch are already here.",
    sent: "Robbie has your seat. Show this pass at the door.",
    device:
      "Your seat was not sent to Robbie. Try again in a moment.",
    sparksNote: "Sparks you pin stay on this phone until the shared wall opens.",
    stamp: "Press the seal",
    stampReady: "Ink is on the pass. Put your name under it.",
    tear: "Tear the stub",
    torn: "Stub open",
    floorLead: "Tap a room to light it. This phone remembers the walk.",
    floorDone: "You walked the whole floor.",
    toss: "Toss it on the plaster",
    emptyTitle: "The next night has not been hung",
    emptyBody:
      "When Robbie posts a night at Hacienda, the pass, the floor, and the door live here. Until then, the house is still open.",
    shareLead: "I’m holding a seat at The Artist Post",
  },
  wall: {
    kicker: "The Wall",
    title: "Explore local arts, music, theater, and culture",
    lead: "The Wall is TAP’s living gallery in West Palm Beach — arts, music, theater, and culture on the plaster. Pan and zoom a frame. Nothing here is an invented portrait — empty frames stay lit until a real artist is approved.",
    preparingTitle: "The stage is being prepared",
    preparingBody:
      "Lights are up at Hacienda. Frames are hung and waiting for names. Nights are penciled. Kindness is already on the plaster.",
    quietTitle: "This lane is still being hung",
    quietBody:
      "Nothing matches that filter yet. The wall is still a room — try another medium, or reserve a frame of your own.",
    reservedTitle: "Waiting for a name",
    reservedBody:
      "This frame is hung and lit. When an artist is approved, their portrait and story land here — never a placeholder face.",
    bookFrame: "Request this frame",
    filters: {
      medium: "Medium",
      neighborhood: "Neighborhood",
      availability: "Availability",
      date: "Showcase",
    },
  },
  home: {
    haciendaTitle: "The Artist Post @ The Hacienda",
    haciendaBody:
      "Step into our live creative space inside Hacienda, where local artists, community, and culture come together. Explore rotating artist showcases, donation-based merch, curated finds, and a space designed to connect, create, and grow. Every visit helps support our mission of building a permanent home for art in the future.",
    featuredTitle: "Featured Artists",
    featuredEmpty:
      "Featured artists coming soon. Visit us at Hacienda or check back as new showcases go live.",
    contactTitle: "Contact Us",
    contactLead: "Better yet, see us in person!",
    contactBody:
      "We love our community, so feel free to visit during normal business hours to check out our featured local artists and to obtain our merch!",
    dropLine: "Drop us a line!",
    getDirections: "Get directions",
    subscribeTitle: "Subscribe",
    subscribeBody: "Sign up to hear from us about specials, sales, and events.",
    socialTitle: "Social",
  },
  about: {
    title: "About",
    mission:
      "The Artist Post® is a community-driven platform dedicated to supporting and advocating for local artists and small businesses. We create real opportunities for creatives to be seen, heard, and supported, without the usual barriers. Through curated events, pop-up activations, and collaborative spaces, we connect artists directly with their communities. From showcasing original work to offering donation-based retail opportunities, our goal is to help artists turn their passion into visibility, connection, and growth.",
    proceeds:
      "All Proceeds Raised Go Towards Local Arts, the Artists, the Venues, and Local Community Events.",
    instagramCta: "Follow me on Instagram",
    donateCta: "Donate",
    partnerLabel: "Partner",
    marksKicker: "Registered marks",
    marksTitle: "The house has a name",
    marksBody:
      "The Artist Post®, Kindness Always®, and Love | ALL · Dream | TOGETHER · Create | AS ONE™ travel with the work. BE KIND, SHINE BRIGHT!",
    supportTitle: "Toward a permanent home",
    supportBody:
      "Your donations help keep our space going and build toward a physical location in the future. Every bit helps us grow closer to a permanent home for art and creativity.",
    liveRoomTitle: "The live room",
    liveRoomBody:
      "Hacienda on Clematis is where TAP meets people in the room — rotating showcases, donation-based merch, and a space built to connect.",
  },
  schedule: {
    title: "Artist Schedule",
    supportLine: "Come support our scheduled local artisans.",
    showcaseTitle: "Artisan Showcase",
    venue: "Hacienda",
    status: "Artist Schedule Coming Soon!",
    ready: "Ready to take the FIRST step?",
    step1: "STEP 1: Review & Sign The Agreement To Get Started!",
    step1Cta: "Get Started",
    step2Lead: "After Signed Agreement & Approval:",
    step2: "STEP 2: You Will Get Sent A Scheduling Link.",
  },
  kindness: {
    title: "Kindness Always / Merch",
    body: "Kindness Always isn’t about being perfect, it’s about being intentional. It’s a reminder that we all have our flaws, our off days, and our struggles, but we still have the power to choose kindness. When you wear it, you’re making that choice, to lead with compassion, to uplift others, and to move through life with purpose in everything you do.",
    orderLine: "Call/Text To Place An Order",
    merchBody:
      "The Artist Post merch and Kindness Always brand bring together art, community, and purpose. Each piece supports local creatives while representing a simple truth.. We may not be perfect, but we can always choose to lead with kindness.",
    buyCta: "Buy Merch",
  },
  supporters: {
    title: "Supporters",
    findTitle: "FIND The Artist Post",
    expansion:
      "The Artist Post is growing with the vision of operating nationwide. We believe every community deserves a hub where local artists are seen, supported, and celebrated.",
    launchTitle: "Launch a Local Chapter",
    wantTitle: "Want The Artist Post In Your City?",
    applyBody:
      "If you're interested in starting a chapter in your area, start by applying here and attaching your vision.",
    applyCta: "Submit Application",
    legalNote:
      "Certificates of legal operation are available upon request. Map regions include Oklahoma, Idaho, Nevada, Tennessee, Washington, Florida, and Texas.",
  },
} as const;
