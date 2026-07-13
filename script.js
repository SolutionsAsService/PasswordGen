/**
 * Generate Password
 * Always guarantees every selected character type exists.
 */
function generatePassword() {

    const lengthInput = document.getElementById("length");

    let length = parseInt(lengthInput.value, 10) || 12;

    const includeCaps =
        document.getElementById("includeCaps").checked;

    const includeNumbers =
        document.getElementById("includeNumbers").checked;

    const includeSpecial =
        document.getElementById("includeSpecial").checked;


    // Character Sets
    const LOWERCASE =
        "abcdefghijklmnopqrstuvwxyz";

    const UPPERCASE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const NUMBERS =
        "0123456789";

    const SPECIAL =
        "!@#$%^&*()_+-=[]{}|;:,.<>?";


    //-------------------------------------
    // Build Required Sets
    //-------------------------------------

    const requiredSets = [];
    let characterPool = LOWERCASE;

    if (includeCaps) {
        requiredSets.push(UPPERCASE);
        characterPool += UPPERCASE;
    }

    if (includeNumbers) {
        requiredSets.push(NUMBERS);
        characterPool += NUMBERS;
    }

    if (includeSpecial) {
        requiredSets.push(SPECIAL);
        characterPool += SPECIAL;
    }


    //-------------------------------------
    // Minimum Length
    //-------------------------------------

    const minimumLength =
        Math.max(4, requiredSets.length + 1);

    if (length < minimumLength) {

        length = minimumLength;
        lengthInput.value = minimumLength;

    }


    //-------------------------------------
    // Start Password
    //-------------------------------------

    const password = [];


    // Always include one lowercase
    password.push(randomCharacter(LOWERCASE));


    // Force every selected set
    requiredSets.forEach(set => {
        password.push(randomCharacter(set));
    });


    //-------------------------------------
    // Fill Remaining Characters
    //-------------------------------------

    while (password.length < length) {

        password.push(
            randomCharacter(characterPool)
        );

    }


    //-------------------------------------
    // Shuffle
    //-------------------------------------

    shuffleArray(password);

    const finalPassword =
        password.join("");

    passwordOutput.innerText = finalPassword;

    updateStrength(finalPassword);

}



/**
 * Cryptographically Secure Random Character
 */
function randomCharacter(characters) {

    const random = new Uint32Array(1);

    crypto.getRandomValues(random);

    return characters[
        random[0] % characters.length
    ];

}



/**
 * Fisher-Yates Shuffle (Secure)
 */
function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const random = new Uint32Array(1);

        crypto.getRandomValues(random);

        const j = random[0] % (i + 1);

        [array[i], array[j]] =
            [array[j], array[i]];

    }

    return array;

}
