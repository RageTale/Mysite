import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getStatusColor } from '../utils/helpers';

interface CalendarGridProps {
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  appointments: Appointment[];
  onSlotSelect: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  view,
  currentDate,
  appointments,
  onSlotSelect,
}) => {
  const { clients, settings } = useAppContext();

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = settings.startHour; hour < settings.endHour; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  // Get client name
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown';
  };

  // Generate days for the current view
  const generateDays = () => {
    const days = [];
    const date = new Date(currentDate);
    
    if (view === 'day') {
      days.push(new Date(date));
    } else if (view === 'week') {
      // Start from Sunday of the current week
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      
      for (let i = 0; i < 7; i++) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
    } else if (view === 'month') {
      // Start from the first day of the month
      date.setDate(1);
      
      // Go back to the first day of the week (Sunday)
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      
      // Generate 6 weeks worth of days (42 days)
      for (let i = 0; i < 42; i++) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
    }
    
    return days;
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  // Filter appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => {
      const appDate = new Date(appointment.startTime);
      return appDate.getDate() === date.getDate() &&
             appDate.getMonth() === date.getMonth() &&
             appDate.getFullYear() === date.getFullYear();
    });
  };
  
  // Filter appointments for a specific time slot
  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appDate = new Date(appointment.startTime);
      return appDate.getDate() === date.getDate() &&
             appDate.getMonth() === date.getMonth() &&
             appDate.getFullYear() === date.getFullYear() &&
             appDate.getHours() === hour;
    });
  };
  
  // Render day view
  const renderDayView = () => {
    const timeSlots = generateTimeSlots();
    const day = new Date(currentDate);
    
    return (
      <div className="flex flex-col h-full border-t border-l">
        {timeSlots.map((hour) => {
          const appointments = getAppointmentsForTimeSlot(day, hour);
          const slotDate = new Date(day);
          slotDate.setHours(hour, 0, 0, 0);
          
          return (
            <div key={hour} className="flex-1 min-h-[80px] border-b border-r relative group">
              <div className="absolute left-0 -top-3 w-16 text-xs text-gray-500 text-right pr-2">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
              </div>
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => onSlotSelect(slotDate)}
              ></div>
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className={`absolute left-16 right-4 p-2 rounded text-xs ${getStatusColor(appointment.status)} opacity-90 hover:opacity-100 cursor-pointer overflow-hidden`}
                  style={{
                    top: `${new Date(appointment.startTime).getMinutes() / 60 * 100}%`,
                    height: `${(new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / (1000 * 60 * 60) * 100}%`,
                    minHeight: '20px',
                    maxHeight: '100%',
                    zIndex: 10
                  }}
                >
                  <div className="font-medium truncate">{appointment.title}</div>
                  <div className="truncate">{getClientName(appointment.clientId)}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const days = generateDays();
    const timeSlots = generateTimeSlots();
    
    return (
      <div className="flex flex-col h-full">
        {/* Day headers */}
        <div className="flex border-l">
          <div className="w-16 flex-shrink-0"></div>
          {days.map((day, index) => (
            <div 
              key={index}
              className={`flex-1 py-2 text-center border-r font-medium ${
                isToday(day) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              <div className="text-xs uppercase">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className={`text-sm mt-1 ${isToday(day) ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="flex flex-1 overflow-y-auto border-t">
          <div className="w-16 flex-shrink-0 relative">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-20 border-b relative">
                <div className="absolute right-2 -top-3 text-xs text-gray-500">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex-1 flex">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="flex-1 border-r">
                {timeSlots.map((hour, hourIndex) => {
                  const appointments = getAppointmentsForTimeSlot(day, hour);
                  const slotDate = new Date(day);
                  slotDate.setHours(hour, 0, 0, 0);
                  
                  return (
                    <div 
                      key={hourIndex} 
                      className="h-20 border-b relative group"
                      onClick={() => onSlotSelect(slotDate)}
                    >
                      {appointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className={`absolute left-1 right-1 p-1 rounded text-xs ${getStatusColor(appointment.status)} opacity-90 hover:opacity-100 cursor-pointer overflow-hidden`}
                          style={{
                            top: `${new Date(appointment.startTime).getMinutes() / 60 * 100}%`,
                            height: `${(new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / (1000 * 60 * 60) * 100}%`,
                            minHeight: '20px',
                            maxHeight: '100%',
                            zIndex: 10
                          }}
                        >
                          <div className="font-medium truncate">{appointment.title}</div>
                          <div className="truncate">{getClientName(appointment.clientId)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render month view
  const renderMonthView = () => {
    const days = generateDays();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return (
      <div className="grid grid-cols-7 h-full border-l border-t">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => (
          <div key={index} className="py-2 text-center border-r text-sm font-medium text-gray-700">
            {dayName}
          </div>
        ))}
        
        {/* Date grid */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonthDay = isCurrentMonth(day);
              const slotDate = new Date(day);
              slotDate.setHours(settings.startHour, 0, 0, 0);
              
              return (
                <div 
                  key={dayIndex}
                  className={`min-h-[100px] p-2 border-r border-b relative ${
                    isToday(day)
                      ? 'bg-blue-50'
                      : isCurrentMonthDay
                        ? 'bg-white'
                        : 'bg-gray-50'
                  }`}
                  onClick={() => onSlotSelect(slotDate)}
                >
                  <div className={`text-right ${
                    isToday(day)
                      ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center ml-auto'
                      : isCurrentMonthDay
                        ? 'text-gray-900'
                        : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[85px]">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`py-1 px-2 rounded text-xs truncate ${getStatusColor(appointment.status)}`}
                      >
                        {new Date(appointment.startTime).toLocaleTimeString(undefined, { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })} - {appointment.title}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-full">
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </div>
  );
};

export default CalendarGrid;