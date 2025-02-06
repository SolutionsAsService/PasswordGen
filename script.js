function generatePassword() {
    const length = document.getElementById('length').value;
    const includeCaps = document.getElementById('includeCaps').checked;
    const includeSpecial = document.getElementById('includeSpecial').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (includeCaps) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeSpecial) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    if (includeNumbers) chars += '0123456789';

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    document.getElementById('passwordOutput').innerText = password;
}
