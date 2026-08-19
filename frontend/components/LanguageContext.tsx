"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, defaultText: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navbar & Global
  "start_audit": { en: "Start an audit", bn: "অডিট শুরু করুন" },
  "home": { en: "Home", bn: "হোম" },
  "about": { en: "About", bn: "আমাদের সম্পর্কে" },
  "login": { en: "Login (Demo)", bn: "লগইন (ডেমো)" },
  "browse": { en: "Buildings", bn: "বিল্ডিং সমূহ" },
  "score": { en: "Score", bn: "স্কোর" },
  "view_details": { en: "View Details", bn: "বিস্তারিত দেখুন" },
  
  // Hero
  "hero_subtitle": { en: "Upload building photos and let our rule-based AI engine instantly audit physical accessibility with pinpoint accuracy.", bn: "বিল্ডিংয়ের ছবি আপলোড করুন এবং আমাদের AI ইঞ্জিন দিয়ে নিমিষেই ফিজিক্যাল অ্যাক্সেসিবিলিটি অডিট করে নিন।" },
  "buildings_audited": { en: "Buildings Audited", bn: "মোট অডিট" },
  "avg_accessibility": { en: "Avg. Accessibility", bn: "গড় অ্যাক্সেসিবিলিটি" },

  // Public Map Section
  "browse_places_title": { en: "Browse Accessible Places", bn: "অ্যাক্সেসযোগ্য স্থানগুলো খুঁজুন" },
  "browse_places_desc": { en: "Explore buildings in your area that have been audited for accessibility. Find places with ramps, elevators, and clear pathways.", bn: "আপনার আশেপাশের অ্যাক্সেসযোগ্য বিল্ডিংগুলো খুঁজুন। র‍্যাম্প, এলিভেটর এবং হুইলচেয়ার যাওয়ার পথ আছে এমন জায়গাগুলো আবিষ্কার করুন।" },
  "loading_map": { en: "Loading Map Data...", bn: "ম্যাপ লোড হচ্ছে..." },

  // Upload Modal
  "new_location_audit": { en: "New Location Audit", bn: "নতুন লোকেশন অডিট" },
  "update_audit": { en: "Update Existing Audit", bn: "বর্তমান অডিট আপডেট করুন" },
  "attach_evidence": { en: "Attach latest evidence photos for inspection.", bn: "ইন্সপেকশনের জন্য সর্বশেষ প্রমাণের ছবি যুক্ত করুন।" },
  "building_name": { en: "Building Name", bn: "বিল্ডিংয়ের নাম" },
  "building_name_placeholder": { en: "Official building name...", bn: "অফিসিয়াল বিল্ডিংয়ের নাম..." },
  "location_address": { en: "Location / Address", bn: "লোকেশন / ঠিকানা" },
  "location_placeholder": { en: "E.g. Dhaka, Bangladesh", bn: "যেমন: ঢাকা, বাংলাদেশ" },
  "evidence_photos": { en: "Evidence Photos (Max 5)", bn: "প্রমাণের ছবি (সর্বোচ্চ ৫টি)" },
  "files_attached": { en: "FILE(S) ATTACHED", bn: "টি ফাইল যুক্ত করা হয়েছে" },
  "create_collage": { en: "CREATE COLLAGE (SAVE TOKENS)", bn: "কোলাজ তৈরি করুন (টোকেন বাঁচান)" },
  "collage_ready": { en: "COLLAGE READY FOR UPLOAD", bn: "আপলোডের জন্য কোলাজ প্রস্তুত" },
  "processing": { en: "Processing...", bn: "প্রক্রিয়াকরণ চলছে..." },
  "create_and_audit": { en: "CREATE & AUDIT", bn: "তৈরি ও অডিট করুন" },
  "reuse_last": { en: "REUSE LAST UPLOAD (DEV)", bn: "সর্বশেষ আপলোডটি পুনরায় ব্যবহার করুন (DEV)" },
  "select_location": { en: "Select Building Location", bn: "বিল্ডিংয়ের লোকেশন নির্বাচন করুন" },

  // Location Picker Map
  "location_selected": { en: "Location selected.", bn: "লোকেশন নির্বাচন করা হয়েছে।" },
  "click_to_pin": { en: "Click on the map to place a pin.", bn: "ম্যাপে ক্লিক করে পিন বসান।" },
  "getting_address": { en: "Getting Address...", bn: "ঠিকানা খোঁজা হচ্ছে..." },
  "confirm_location": { en: "Confirm Location", bn: "লোকেশন নিশ্চিত করুন" },

  // Report Card
  "official_report": { en: "Official Accessibility Inspection Report", bn: "অফিসিয়াল অ্যাক্সেসিবিলিটি ইন্সপেকশন রিপোর্ট" },
  "document_id": { en: "Document ID:", bn: "ডকুমেন্ট আইডি:" },
  "date_of_audit": { en: "Date of Audit:", bn: "অডিটের তারিখ:" },
  "final_score": { en: "Final Compliance Score", bn: "চূড়ান্ত কমপ্লায়েন্স স্কোর" },
  "detailed_assessment": { en: "I. Detailed Criteria Assessment", bn: "১. বিস্তারিত মানদণ্ড মূল্যায়ন" },
  "export_pdf": { en: "Export PDF", bn: "PDF ডাউনলোড করুন" },
  "end_of_report": { en: "End of Report • WayMark AI Engine", bn: "রিপোর্টের সমাপ্তি • WayMark AI ইঞ্জিন" },
  
  // Status Labels
  "status_pass": { en: "PASS", bn: "পাস" },
  "status_fail": { en: "FAIL", bn: "ফেইল" },
  "status_uncertain": { en: "NEEDS REVIEW", bn: "রিভিউ প্রয়োজন" },
  "status_unverified": { en: "UNVERIFIED", bn: "যাচাই করা হয়নি" },

  // How It Works
  "how_it_works_title": { en: "How It Works", bn: "কীভাবে কাজ করে" },
  "how_it_works_desc": { en: "Three simple steps to generate a professional accessibility audit.", bn: "প্রফেশনাল অ্যাক্সেসিবিলিটি অডিট তৈরি করার ৩টি সহজ ধাপ।" },
  "step_1_title": { en: "1. Upload Photos", bn: "১. ছবি আপলোড করুন" },
  "step_1_desc": { en: "Snap and upload photos of building entrances, ramps, and facilities.", bn: "বিল্ডিংয়ের প্রবেশপথ, র‍্যাম্প এবং অন্যান্য সুবিধার ছবি তুলুন এবং আপলোড করুন।" },
  "step_2_title": { en: "2. AI Analysis", bn: "২. এআই অ্যানালাইসিস" },
  "step_2_desc": { en: "Our vision model instantly detects key accessibility features and flags barriers.", bn: "আমাদের ভিশন এআই মডেল মুহূর্তের মধ্যেই অ্যাক্সেসিবিলিটি যাচাই করে এবং বাধাগুলো চিহ্নিত করে।" },
  "step_3_title": { en: "3. Get Report", bn: "৩. রিপোর্ট পান" },
  "step_3_desc": { en: "Receive a detailed compliance score and an actionable audit report.", bn: "অডিট রিপোর্ট এবং বিস্তারিত কমপ্লায়েন্স স্কোর বুঝে নিন।" },

  // Results Carousel
  "recent_locations": { en: "Recent Locations", bn: "সাম্প্রতিক অডিটসমূহ" },
  "view_all": { en: "View All", bn: "সবগুলো দেখুন" },
  "status_excellent": { en: "Excellent", bn: "চমৎকার" },
  "status_moderate": { en: "Moderate", bn: "মোটামুটি" },
  "status_poor": { en: "Poor", bn: "খারাপ" },
  "not_available": { en: "N/A", bn: "প্রযোজ্য নয়" },

  // Audit Search Page
  "search_location": { en: "Search Location", bn: "লোকেশন খুঁজুন" },
  "search_location_desc": { en: "Search for an existing building to update its audit, or add a new one.", bn: "অডিট আপডেট করার জন্য একটি বিদ্যমান বিল্ডিং খুঁজুন, অথবা নতুন একটি যোগ করুন।" },
  "enter_building_name": { en: "Enter building name...", bn: "বিল্ডিংয়ের নাম লিখুন..." },
  "existing_locations": { en: "Existing Locations", bn: "বিদ্যমান লোকেশনসমূহ" },
  "add_new_building": { en: "Add New Building", bn: "নতুন বিল্ডিং যোগ করুন" },
  "create_new_audit_profile": { en: "Create a new audit profile for", bn: "এর জন্য নতুন অডিট প্রোফাইল তৈরি করুন" },
  "loading_buildings": { en: "Loading buildings...", bn: "বিল্ডিং লোড হচ্ছে..." },
  
  // Previous Audit View
  "previous_audit_record": { en: "Previous Audit Record", bn: "পূর্ববর্তী অডিট রেকর্ড" },
  "review_inspection": { en: "Review the most recent inspection for", bn: "এর জন্য সর্বশেষ ইন্সপেকশন রিভিউ করুন" },
  "update_photos": { en: "Update Photos & Re-Audit", bn: "ছবি আপডেট করুন ও পুনরায় অডিট করুন" },
  "back_to_search": { en: "Back to Search", bn: "সার্চে ফিরে যান" },
  "loading_official_report": { en: "Loading official report...", bn: "অফিসিয়াল রিপোর্ট লোড হচ্ছে..." },
  "no_previous_reports": { en: "No previous reports found for this building.", bn: "এই বিল্ডিংয়ের জন্য কোনো পূর্ববর্তী রিপোর্ট পাওয়া যায়নি।" },
  
  // Buildings List Page
  "audited_locations": { en: "Audited Locations", bn: "অডিট করা লোকেশনসমূহ" },
  "audited_locations_desc": { en: "View accessibility history for all scanned locations.", bn: "সমস্ত স্ক্যান করা লোকেশনের অডিট হিস্ট্রি দেখুন।" },
  "filter_by_building": { en: "Filter by building name or location...", bn: "বিল্ডিংয়ের নাম বা লোকেশন দিয়ে খুঁজুন..." },
  "no_buildings_audited": { en: "No buildings have been audited yet.", bn: "এখনও কোনো বিল্ডিং অডিট করা হয়নি।" },
  "no_buildings_match": { en: "No buildings match your search.", bn: "আপনার খোঁজার সাথে কোনো বিল্ডিং মিলছে না।" },
  
  // Building Details Page
  "back_to_buildings": { en: "Back to buildings", bn: "বিল্ডিং লিস্টে ফিরে যান" },
  "loading_building_history": { en: "Loading Building History...", bn: "বিল্ডিংয়ের হিস্ট্রি লোড হচ্ছে..." },
  "building_not_found": { en: "Building not found", bn: "বিল্ডিং পাওয়া যায়নি" },
  "added": { en: "Added:", bn: "যুক্ত করা হয়েছে:" },
  "audits": { en: "Audits", bn: "অডিট" },
  "latest_score": { en: "Latest Score", bn: "সর্বশেষ স্কোর" },
  "official_inspection_report": { en: "Official Inspection Report", bn: "অফিসিয়াল ইন্সপেকশন রিপোর্ট" },
  // Criteria Names
  "crit_ramp": { en: "Ramp", bn: "র‍্যাম্প" },
  "crit_step_free_entrance": { en: "Step Free Entrance", bn: "ধাপ-মুক্ত প্রবেশদ্বার" },
  "crit_wide_doorways": { en: "Wide Doorways", bn: "প্রশস্ত দরজা" },
  "crit_tactile_paving": { en: "Tactile Paving", bn: "ট্যাকটাইল পেভিং" },
  "crit_accessible_restroom": { en: "Accessible Restroom", bn: "অ্যাক্সেসিবল রেস্টরুম" },
  "crit_clear_pathways": { en: "Clear Pathways", bn: "পরিষ্কার হাঁটার পথ" },
  "crit_braille_signage": { en: "Braille Signage", bn: "ব্রেইল সাইনেজ" },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key, defaultText) => defaultText,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => setLanguage(prev => prev === "en" ? "bn" : "en");

  const t = (key: string, defaultText: string) => {
    return translations[key]?.[language] || defaultText;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
