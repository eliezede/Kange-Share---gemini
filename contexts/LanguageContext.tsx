
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'pt';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        explore_near_me: "Explore Near Me",
        saved_places: "Saved Places",
        hi: "Hi",
        ready_hydrate: "Ready to hydrate your potential?",
        wellness_partners: "Certified Wellness Partners",
        recommended: "Recommended for You",
        home: "Home",
        requests: "Requests",
        messages: "Messages",
        you: "You",
        settings: "Settings",
        language: "Language",
        dark_mode: "Dark Mode",
        translate_story: "Translate Story",
        translating: "Translating...",
        original_story: "See original",
        view_profile: "View Profile",
        edit_profile: "Edit Profile",
        followers: "Followers",
        following: "Following",
        saved: "Saved",
        join_network: "Join the Network",
        today_schedule: "Today's Schedule",
        all_caught_up: "All caught up!",
        verified_host: "Verified Host",
        wellness_partner: "Wellness Partner",
        request_water: "Request Water",
        get_directions: "Get Directions",
        the_story: "The Story",
        amenities: "Amenities",
        guest_feedback: "Guest Feedback",
        write_review: "Write a Review",
    },
    pt: {
        explore_near_me: "Explorar Perto de Mim",
        saved_places: "Locais Salvos",
        hi: "Olá",
        ready_hydrate: "Pronto para hidratar seu potencial?",
        wellness_partners: "Wellness Partners Certificados",
        recommended: "Recomendado para Você",
        home: "Início",
        requests: "Pedidos",
        messages: "Mensagens",
        you: "Você",
        settings: "Ajustes",
        language: "Idioma",
        dark_mode: "Modo Escuro",
        translate_story: "Traduzir história",
        translating: "Traduzindo...",
        original_story: "Ver original",
        view_profile: "Ver Perfil Público",
        edit_profile: "Editar Perfil",
        followers: "Seguidores",
        following: "Seguindo",
        saved: "Salvos",
        join_network: "Entrar na Rede",
        today_schedule: "Agenda de Hoje",
        all_caught_up: "Tudo em dia!",
        verified_host: "Anfitrião Verificado",
        wellness_partner: "Parceiro Wellness",
        request_water: "Pedir Água",
        get_directions: "Como Chegar",
        the_story: "A História",
        amenities: "Comodidades",
        guest_feedback: "Feedback dos Hóspedes",
        write_review: "Escrever Avaliação",
    }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('language');
        if (stored === 'en' || stored === 'pt') return stored;
        return navigator.language.startsWith('pt') ? 'pt' : 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
