interface Request {
  id: number;
  type: string;
  status: string;
  data: string;
  createdAt: string;
}

interface RequestsListProps {
  requests: Request[];
}

export default function RequestsList({ requests }: RequestsListProps) {
  const getDataObj = (dataStr: string) => {
    try {
      return typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
    } catch {
      return {};
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      callback: 'Обратный звонок',
      product: 'Запрос о товаре',
      service: 'Запрос на обслуживание',
      general: 'Общий',
      cart: 'Корзина',
      leasing: 'Лизинг',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Новый',
      processed: 'Обработан',
      completed: 'Завершён',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Запросы</h1>
        <p className="text-gray-600 mt-2">Получено {requests.length} запросов</p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => {
            const dataObj = getDataObj(request.data);
            return (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getTypeLabel(request.type)}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(request.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">#{request.id}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {Object.entries(dataObj).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 uppercase">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Запросов не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
