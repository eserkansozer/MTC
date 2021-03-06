describe 'Questions API spec' do
  context 'POST request to /api/questions' do
    it 'should return questions set payload as JSON' do
      request_helper = RequestHelper.new
      response = request_helper.questions('abc12345', '9999a')
      expect(response.code).to eql 200
      expect(response.message).to eql 'OK'
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['access_token']).to_not be_nil
      expect(parsed_response['questions'].size).to eql 10
      expect(parsed_response['pupil']['firstName']).to eql 'Standard'
      expect(parsed_response['pupil']['lastName']).to eql 'Pupil'
      expect(parsed_response['school']['id']).to eql 18600
      expect(parsed_response['school']['name']).to eql 'Test School'
      expect(parsed_response['config']['questionTime']).to eql 6
      expect(parsed_response['config']['loadingTime']).to eql 3
    end
  end

  context 'GET request to /api/questions' do
    it 'should return 405 Method Not Allowed' do
      response = HTTParty.get(BASE_URL+'/api/questions')
      expect(response.code).to eql 405
      expect(response.message).to eql 'Method Not Allowed'
    end
  end

  context 'POST request to /api/questions with no pupil pin' do
    it 'should return 400 Bad Request' do
      request_helper = RequestHelper.new
      response = request_helper.questions('abc12345', nil)
      expect(response.code).to eql 400
      expect(response.message).to eql 'Bad Request'
    end
  end

  context 'POST request to /api/questions with no school pin' do
    it 'should return 400 Bad Request' do
      request_helper = RequestHelper.new
      response = request_helper.questions(nil, '9999a')
      expect(response.code).to eql 400
      expect(response.message).to eql 'Bad Request'
    end
  end

  context 'POST request to /api/questions with invalid school pin and pupil pin combination' do
    it 'returns 401 Unauthorized' do
      request_helper = RequestHelper.new
      response = request_helper.questions('bc2345', '9999')
      expect(response.code).to eql 401
      expect(response.message).to eql 'Unauthorized'
    end
  end

end
