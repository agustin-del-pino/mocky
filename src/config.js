const Config = {
    port: 8080
}

Object.keys(process.env).forEach(env=>{
    const c = env.toLowerCase().replace(/_.{1}/g, e=>e[1].toUpperCase());
    if (!Object.hasOwn(Config, c)) {
        return;
    }
    Config[c] = Config[c].constructor(process.env[env]);
})

export default Config;
