const _config = {
    // Client Settings
    token: "",
    color: `00ccff`,

    //Database for help https://docs.xendev.us/#/databases?id=mongodb
    database: "",

    // Guild Verification Checker
    useVerificationChecker: true,
    Verified_Guilds: [
        `715707547247575122`
    ],

    //Leveling System
    levels: {
        xpNeededPerLevel: 1000,
        xpPerMessage: 100,
    },

    // Internal/Developer Settings
    error_logs: true,
    process_error_logs: true,
}

module.exports = _config;