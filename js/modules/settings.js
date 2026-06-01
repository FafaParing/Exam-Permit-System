// --- 4. MODULE LOGIC: SETTINGS ---

const settings = {
    render: function () {
        const f = document.getElementById('settings-form');
        if (!f) return;

        f.schoolName.value = db.data.settings.schoolName;
        f.academicYear.value = db.data.settings.academicYear;
        if (f.activeSemester) f.activeSemester.value = db.data.settings.activeSemester || activeSemester;
    },

    save: function (e) {
        e.preventDefault();

        db.data.settings.schoolName = e.target.schoolName.value;
        db.data.settings.academicYear = e.target.academicYear.value;

        if (e.target.activeSemester) {
            db.data.settings.activeSemester = e.target.activeSemester.value;
            activeSemester = db.data.settings.activeSemester;

            // Enforce: only exam periods under the selected semester are shown/active
            for (let i = 0; i < db.data.examPeriods.length; i++) {
                if (db.data.examPeriods[i].semester !== activeSemester) db.data.examPeriods[i].status = 'Inactive';
            }
        }

        db.save();
        utils.showToast('Settings saved');
    }
};

window.settings = settings;
