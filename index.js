
const  bookEndPoint = "http://localhost:3000/bookings"

document.addEventListener('DOMContentLoaded' , async ()=>{
     const getStarted = document.getElementById('started')
     getStarted.addEventListener('click', ()=>{
        document.getElementById('servicesList').style.display = 'flex'
        document.getElementById('first').style.display = 'none'
     })
     await loadServices();
})
 async function loadServices(){
   const res =  await fetch("http://localhost:3000/services");
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
       div.classList.add( 'bg-white', 'p-6', 'rounded-lg', 'shadow-lg','w-full','sm:w-1/2', 'md:w-1/3', 'lg:w-1/4',);
       div.innerHTML=`
       <h3>${service.name}</h3>
       <p><strong>Category:</strong>${service.category}</p>
       <p><strong>Duration:</strong>${service.durationMinutes}</p>
       <p><strong>Price:</strong>${service.priceKsh}</p>
       <p>${service.description}</p><br>
       <button type="button" class="viewDetails">View providers</button><br><br>`
       div.querySelector('.viewDetails').addEventListener('click', async () =>{
         await showServiceDetails(service)
       });
       list.appendChild(div)
    });
}
async function showServiceDetails(service){
    document.getElementById('servicesList').style.display = 'none'
    const detailsContainer = document.getElementById('serviceDetails')
    detailsContainer.style.display = 'flex'
    detailsContainer.innerHTML= `
    <button id ="back">Back to Services</button>
    <div id="providers"></div>
    <div id="schedule"></div>
    <form id="form">
      <!-- Your booking form fields here -->
      <input type="text" name="customerName" placeholder="Your Name" required />
      <input type="tel" name="phone" placeholder="Phone Number" required />
      <button type="submit">Book Now</button>
    </form>`
    document.getElementById('back').addEventListener('click', ()=>{
        document.getElementById('serviceDetails').style.display = 'none'
        document.getElementById('servicesList').style.display = "flex"
    })
     try{
        const [providersRes , scheduleRes]= await Promise.all([
            fetch (`http://localhost:3000/providers`),
            fetch (`http://localhost:3000/schedule`)
        ]);
        if(!providersRes.ok || !scheduleRes.ok){
            console.log('Failed to fetch the details');
            return;
        }
        const providers = await providersRes.json();
        const schedule = await scheduleRes .json();

        renderProviders(providers)
        renderSchedule(schedule)
     } catch (error) {
        console.error('An error occurred while fetching service details:', error);
     }
}
function renderProviders(providers){
    const providersDiv = document.getElementById('providers');
    providersDiv.innerHTML = `<h4>Providers</h4>`
    if (providers.length === 0 ){
        providersDiv.innerHTML = `<p>No providers available for this service</p>`
        return;
    }
    providers.forEach(provider => {
        const pDiv = document.createElement('div')
        pDiv.innerHTML = `
       <p><strong>Name:</strong>${provider.name}</p>
        <p><strong>Location:</strong>${provider.location}</p>
        <p><strong>Contact:</strong>${provider.contactPhone}</p>
        <p><strong>Rating:</strong>${provider.rating}</p>
         <p>${provider.description}</p>
         `
         providersDiv.appendChild(pDiv)
    })
}
function renderSchedule(schedules){
    const scheduleDiv = document.getElementById('schedule')
    scheduleDiv.innerHTML = `<h4>Schedule</h4>`
    if (schedules.length === 0 ){
        scheduleDiv.innerHTML = `<p>No schedule avilable for this service</p>`
        return
    }
    schedules.forEach(schedule =>{
    const paragraph = document.createElement('div')
    paragraph .innerHTML = `
    <p><strong>Days:</strong>${schedule.dayOfWeek}</p>
    <p><strong>Start Time:</strong>${schedule.startTime}</p>
    <p><strong>End Time:</strong>${schedule.endTime}</p>
    `
    scheduleDiv.appendChild(paragraph)
    })
}
function resetBookingForm(){
    const bookingForm = document.getElementById('form')
    bookingForm.reset()
}