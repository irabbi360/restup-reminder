
function openTabMenu(event, targetName) {
    statisticsCount()
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(targetName).style.display = "block";

    if (event) {
        event.currentTarget.classList.add('active');
    }else {
        const defaultTab = document.querySelector(`li[onclick*="${'Statistics'}"]`);
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
    }
}

function statisticsCount(){
    document.getElementById('suspend-count').innerText = sleepCount;
    document.getElementById('resume-count').innerText = resumeCount;
    document.getElementById('lock-count').innerText = lockCount;
    document.getElementById('unlock-count').innerText = unlockCount;
}

openTabMenu(event, 'Statistics');

function isSameDay(storedDate) {
    const today = new Date();
    return (
        storedDate.getDate() === today.getDate() &&
        storedDate.getMonth() === today.getMonth() &&
        storedDate.getFullYear() === today.getFullYear()
    );
}

function namazTimeInit() {
    const storedNamazTime = store.get('namaz_time', null);

    // If there is stored namaz_time and the date is today, use stored data
    if (storedNamazTime && isSameDay(new Date(storedNamazTime.date))) {
        console.log('Using stored namaz time');
        setNamazTimesOnUI(storedNamazTime);
        return;
    }

    // Fetch new namaz times since the stored one is outdated or missing
    fetch(`http://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2`)
        .then(response => response.json())
        .then(data => {
            const namaz_time = {
                fajr: data.data.timings.Fajr,
                dhuhr: data.data.timings.Dhuhr,
                asr: data.data.timings.Asr,
                maghrib: data.data.timings.Maghrib,
                isha: data.data.timings.Isha,
                date: new Date()
            };
            store.set('namaz_time', namaz_time);
            console.log('Fetched new namaz time');
            setNamazTimesOnUI(namaz_time);
        })
        .catch(error => console.error('Error fetching prayer times:', error));
}

function setNamazTimesOnUI(namazTime) {
    document.getElementById('fajr-namaz').innerText = namazTime.fajr;
    document.getElementById('dhuhr-namaz').innerText = namazTime.dhuhr;
    document.getElementById('asr-namaz').innerText = namazTime.asr;
    document.getElementById('maghrib-namaz').innerText = namazTime.maghrib;
    document.getElementById('isha-namaz').innerText = namazTime.isha;
}

// Call the function
namazTimeInit();