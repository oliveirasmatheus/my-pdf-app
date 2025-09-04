import { useEffect } from "react";

const Home = () => {
    useEffect(() => {
        // Atualiza título e meta
        document.title = "Willian Oliveira Arquitetura | Projetos Residenciais e Comerciais";

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                "content",
                "Escritório de arquitetura em Cruzeiro do Sul/RS especializado em projetos residenciais e comerciais modernos e funcionais. Transformamos sua visão em realidade."
            );
        } else {
            const meta = document.createElement("meta");
            meta.name = "description";
            meta.content =
                "Escritório de arquitetura em Cruzeiro do Sul/RS especializado em projetos residenciais e comerciais modernos e funcionais. Transformamos sua visão em realidade.";
            document.head.appendChild(meta);
        }

        // Carrega Google Fonts
        const linkFont = document.createElement("link");
        linkFont.rel = "stylesheet";
        linkFont.href =
            "https://fonts.googleapis.com/css2?family=Mulish:wght@400;700;800;900&display=swap";
        document.head.appendChild(linkFont);

        // Adiciona CSS do Vue
        const linkCSS = document.createElement("link");
        linkCSS.rel = "stylesheet";
        linkCSS.href = "/assets/index-Ph5UQlrA.css"; // coloque este arquivo em public/assets
        document.head.appendChild(linkCSS);

        // Adiciona script do Vue
        const script = document.createElement("script");
        script.type = "module";
        script.src = "/assets/index-Ci0ylsPH.js"; // coloque este arquivo em public/assets
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);

        // Evita FOUC (opacity)
        document.body.classList.add("loaded");

        // Cleanup ao desmontar
        return () => {
            document.head.removeChild(linkFont);
            document.head.removeChild(linkCSS);
            document.body.removeChild(script);
            document.body.classList.remove("loaded");
        };
    }, []);

    return <div id="app"></div>;
};

export default Home;
