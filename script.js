document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       THEME SYSTEM
    ================================= */

    const themeToggle = document.getElementById("theme-switcher");
    const body = document.body;

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {

            body.classList.toggle("dark-mode");

            const theme = body.classList.contains("dark-mode")
                ? "dark"
                : "light";

            localStorage.setItem("theme", theme);
        });
    }


    /* ================================
       PASSWORD GENERATOR
    ================================= */

    const generateButton = document.getElementById("generate-btn");
    const passwordOutput = document.getElementById("passwordOutput");

    if (generateButton) {
        generateButton.addEventListener("click", generatePassword);
    }


    function secureRandom(max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);

        return array[0] % max;
    }


    function randomCharacter(chars) {
        return chars[secureRandom(chars.length)];
    }


    function shuffleArray(array) {

        for (let i = array.length - 1; i > 0; i--) {

            const j = secureRandom(i + 1);

            [
                array[i],
                array[j]
            ] =
            [
                array[j],
                array[i]
            ];
        }

        return array;
    }


    function generatePassword() {


        let length =
            parseInt(
                document.getElementById("length").value
            );


        const includeCaps =
            document.getElementById("includeCaps").checked;

        const includeSpecial =
            document.getElementById("includeSpecial").checked;

        const includeNumbers =
            document.getElementById("includeNumbers").checked;



        // Character pools

        const lowercase =
            "abcdefghijklmnopqrstuvwxyz";

        const uppercase =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        const numbers =
            "0123456789";

        const special =
            "!@#$%^&*()_+~`|{}[]:;<>?,./-=";



        let allowedCharacters = lowercase;

        let passwordCharacters = [];



        /*
            Always guarantee selected requirements
        */


        if (includeCaps) {

            allowedCharacters += uppercase;

            passwordCharacters.push(
                randomCharacter(uppercase)
            );
        }


        if (includeNumbers) {

            allowedCharacters += numbers;

            passwordCharacters.push(
                randomCharacter(numbers)
            );
        }


        if (includeSpecial) {

            allowedCharacters += special;

            passwordCharacters.push(
                randomCharacter(special)
            );
        }



        allowedCharacters += lowercase;



        // Minimum length check

        if (length < passwordCharacters.length) {

            length = passwordCharacters.length;

            alert(
                `Password length increased to ${length} to satisfy your requirements.`
            );
        }



        // Fill remaining characters

        while (passwordCharacters.length < length) {

            passwordCharacters.push(
                randomCharacter(allowedCharacters)
            );

        }



        // Randomize final password

        passwordCharacters =
            shuffleArray(passwordCharacters);



        const password =
            passwordCharacters.join("");



        passwordOutput.innerText = password;



        updateStrength(password);

    }



    /* ================================
       PASSWORD STRENGTH
    ================================= */

    function updateStrength(password) {


        const strengthDisplay =
            document.getElementById("passwordStrength");


        if (!strengthDisplay)
            return;



        let score = 0;


        if (password.length >= 8)
            score++;

        if (password.length >= 12)
            score++;

        if (/[A-Z]/.test(password))
            score++;

        if (/[0-9]/.test(password))
            score++;

        if (/[^A-Za-z0-9]/.test(password))
            score++;



        const levels = [

            "Very Weak",

            "Weak",

            "Medium",

            "Strong",

            "Very Strong",

            "Excellent"

        ];


        strengthDisplay.innerText =
            "Strength: " +
            levels[score];

    }



    /* ================================
       COPY PASSWORD BUTTON
    ================================= */


    const copyButton =
        document.getElementById("copy-btn");


    if(copyButton){

        copyButton.addEventListener(
            "click",
            async () => {


                const password =
                    passwordOutput.innerText;


                if(!password)
                    return;


                await navigator.clipboard.writeText(password);


                copyButton.innerText =
                    "Copied!";


                setTimeout(()=>{

                    copyButton.innerText =
                        "Copy";

                },1500);


            }
        );

    }


});
