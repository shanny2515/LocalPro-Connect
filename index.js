document.addEventListener('DOMContentLoaded' , async (e)=>{
    e.preventDefault()
     const getStarted = document.getElementById('started')
     getStarted.addEventListener('click', ()=>{
        document.getElementById('servicesList').style.display = 'flex'
        document.getElementById('first').classList.add('hidden')
     })
     await loadServices();
})
 async function loadServices(){
   const res =  await fetch("https://database-csvk.onrender.com/services");
   const services = await res.json();
    return renderServices(services)
}
function renderServices(services){
    const list = document.getElementById('servicesList')
    list.innerHTML = ''
    list.style.display='none'
    const h2 = document.createElement('h2')
    h2.textContent = "Select a service below to view providers and book your appointment."
    h2.className = "head2"
    list.appendChild(h2)
    services.forEach(service => {
       const div = document.createElement('div') 
       div.className = "serviceCard"
       div.classList.add( 'bg-cyan-50', 'p-6', 'rounded-lg', 'shadow-lg','w-full','sm:w-1/2', 'md:w-1/3', 'lg:w-1/4',);
       div.innerHTML=`
       <h2 style="font-family:Verdana, Geneva, Tahoma, sans-serif">${service.name}</h2>
       <p><strong>Category:</strong>${service.category}</p>
       <p><strong>Duration:</strong>${service.durationMinutes}</p>
       <p><strong>Price:</strong>${service.priceKsh}</p>
       <p>${service.description}</p><br>
       <button type="button" class="viewDetails transition delay-50 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110  hover:bg-sky-800 ">View providers</button><br><br>`
       div.querySelector('.viewDetails').addEventListener('click', async () =>{
         await showServiceDetails(service)
       });
       list.appendChild(div)
    });
}
async function showServiceDetails(service) {
    document.getElementById('servicesList').style.display = 'none';
    const detailsContainer = document.getElementById('serviceDetails');
    detailsContainer.style.display = 'flex';
    detailsContainer.innerHTML = `
        <button id="back" class="border  border-2 border-slate-950 text-slate-400 rounded p-2 md:w-1/3 transition delay-50 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110  hover:bg-zinc-700 ">Back to Services</button>
        <div id="providers"></div>
        <div id="schedule"></div>
    `;
    document.getElementById('back').addEventListener('click', () => {
        detailsContainer.style.display = 'none';
        document.getElementById('servicesList').style.display = 'flex';
    });

    try {
        const [providersRes, scheduleRes] = await Promise.all([
            fetch('https://database-csvk.onrender.com/providers'),
            fetch('https://database-csvk.onrender.com/schedule')
        ]);
        if (!providersRes.ok || !scheduleRes.ok) {
            console.log('Failed to fetch the details');
            return;
        }
        const allProviders = await providersRes.json();
        const allSchedules = await scheduleRes.json();

        const filteredProviders = allProviders.filter(provider =>
            provider.servicesOffered.includes(service.id)
        )
        const providerIds = filteredProviders.map(pro => pro.id);
        const filteredSchedules = allSchedules.filter(schedule =>
            providerIds.includes(schedule.providerId)
        )

        renderProviders(filteredProviders, service.id);
        renderSchedule(filteredSchedules);
    } catch (error) {
        console.error('An error occurred while fetching service details:', error);
    }
}
function showBookingForm( serviceId, providerId){
    document.getElementById('serviceDetails').style.display = 'none'
    document.getElementById('book').style.display = 'block';
    const form = document.getElementById('form');
    form.dataset.serviceId = serviceId;
    form.dataset.providerId= providerId
}

function renderProviders(providers, serviceId) {
    const providersDiv = document.getElementById('providers');
    providersDiv.innerHTML = `<h4 class="text-lg font-bold mb-2">Providers</h4>`;
    if (providers.length === 0) {
        providersDiv.innerHTML += `<p>No providers available for this service</p>`;
        return;
    }
    providers.forEach(provider => {
        const pDiv = document.createElement('div');
        pDiv.className = "mb-4 p-2 border border-white rounded bg-cyan-50 shadow-xl/30 sm:w-1/2 md:w-1/3 lg:w-1/2 ";
        pDiv.innerHTML = `
            <p><strong>Name:</strong> ${provider.name}</p>
            <p><strong>Location:</strong> ${provider.location}</p>
            <p><strong>Contact:</strong> ${provider.contactPhone}</p>
            <p><strong>Rating:</strong> ${provider.rating}</p>
            <p>${provider.description}</p>
            <button  class=" bookProviderBtn bg-blue-500 text-white rounded p-2 lg:w-1/2 transition delay-50 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110  hover:bg-sky-500  " 
                data-provider-id="${provider.id}" 
                data-service-id="${serviceId}">
                Book with this provider
            </button>
        `;
        providersDiv.appendChild(pDiv);
    });
        document.querySelectorAll('.bookProviderBtn').forEach(btn =>{
            btn.addEventListener('click', (e) =>{
                const providerId = btn.getAttribute('data-provider-id')
                const serviceId = btn.getAttribute('data-service-id')
                showBookingForm(serviceId , providerId)
            })
        })
}

function renderSchedule(schedules) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = `<h4 class="text-lg font-bold mb-2">Schedule</h4>`;
    if (schedules.length === 0) {
        scheduleDiv.innerHTML += `<p>No schedule available for this service</p>`;
        return;
    }
    schedules.forEach(schedule => {
        const paragraph = document.createElement('div');
        paragraph.className = " p-6 border border-white rounded bg-cyan-50 shadow-xl/30 sm:w-1/2 md:w-1/3 lg:w-1/2 ";
        paragraph.innerHTML = `
            <p><strong>Days:</strong> ${schedule.dayOfWeek}</p>
            <p><strong>Start Time:</strong> ${schedule.startTime}</p>
            <p><strong>End Time:</strong> ${schedule.endTime}</p>
        `;
        scheduleDiv.appendChild(paragraph);
    });
}

document.getElementById('back2').addEventListener('click', ()=>{
    document.getElementById('book').style.display = 'none';
  document.getElementById('serviceDetails').style.display = 'flex';
})
const form = document.getElementById('form')
document.getElementById('form').addEventListener('submit', async (e) =>{
    e.preventDefault();
    const form = e.target;
    const serviceId = form.dataset.serviceId
    const providerId= form.dataset.providerId

    const bookingData = {
        customerName:document.getElementById('name').value.trim(),
        customerPhone: document.getElementById('number').value.trim(),
        time: document.getElementById('time').value.trim(),
        date: document.getElementById('date').value.trim(),
        request: document.getElementById('request').value.trim(),
        serviceId:serviceId,
        providerId:providerId
    };

    if (!bookingData.customerName || !bookingData.customerPhone || !bookingData.time || !bookingData.date) {
        alert('Please fill in all required fields.');
        return;
      }
      try{
        const response = await fetch('https://database-csvk.onrender.com/bookings', {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        })
        if (response.ok){
            alert('booking Succsesful!')
            form.reset();
        }else{
            alert('Booking failed.')
        }
      } catch (error){
        alert('An error occurred.Please try again')
        console.log(error);
      }
      renderProviders(filteredProviders , serviceId)
      renderSchedule(filteredSchedules) 
})


