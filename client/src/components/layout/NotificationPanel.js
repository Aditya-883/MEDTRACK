export default function NotificationPanel({ notifications }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h3 className="font-semibold mb-2">Notifications</h3>

      {notifications.length === 0 ? (
        <p className="text-gray-400 text-sm">No notifications</p>
      ) : (
        notifications.map((n, i) => (
          <div key={i} className="text-sm border-b py-1">{n}</div>
        ))
      )}
    </div>
  );
}