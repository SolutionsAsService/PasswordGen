function generatePassword() {

    let length = parseInt(
        document.getElementById("length").value
    );


    const includeCaps =
        document.getElementById("includeCaps").checked;

    const includeSpecial =
        document.getElementById("includeSpecial").checked;

    const includeNumbers =
        document.getElementById("includeNumbers").checked;



    // Minimum password length
    if (length < 4) {
        length = 4;
    }



    const lowercase =
        "abcdefghijklmnopqrstuvwxyz";

    const uppercase =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const numbers =
        "0123456789";

    const special =
        "!@#$%^&*()_+{}[]<>?/";



    let requiredCharacters = [];

    let characterPool = lowercase;



    // FORCE REQUIRED CHARACTERS FIRST

    if (includeCaps) {

        requiredCharacters.push(
            randomCharacter(uppercase)
        );

        characterPool += uppercase;
    }



    if (includeNumbers) {

        requiredCharacters.push(
            randomCharacter(numbers)
        );

        characterPool += numbers;
    }



    if (includeSpecial) {

        requiredCharacters.push(
            randomCharacter(special)
        );

        characterPool += special;
    }



    /*
       If requirements exceed length,
       expand password automatically
    */

    if (length < requiredCharacters.length) {

        length = requiredCharacters.length;

    }



    let password = [
        ...requiredCharacters
    ];



    // Fill remaining spots

    while(password.length < length){

        password.push(
            randomCharacter(characterPool)
        );

    }



    // Shuffle final password

    password =
        shuffleArray(password);



    const finalPassword =
        password.join("");



    passwordOutput.innerText =
        finalPassword;



    updateStrength(finalPassword);



}
