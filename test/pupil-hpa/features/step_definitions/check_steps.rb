Given(/^I have started the check(?: using the (.+))?$/) do |input|
  input_type = (input ? input : 'numpad')
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the #{input_type}"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
end

Given(/^I complete the warm up questions using the (.+)$/) do |input_type|
  @warm_up_inputs = warm_up_page.complete_check_with_correct_answers(3, input_type)
end

Then(/^the loading page should display for the configured number of seconds$/) do
  check_page.wait_for_preload_to_expire(2)
  expect(check_page).to have_question
end

When(/^the loading screen has expired$/) do
  check_page.wait_for_preload_to_expire(2)
end

Then(/^I should see a question$/) do
  expect(check_page).to have_question
end

Then(/^the question should display for the configured number of seconds$/) do
  @question = check_page.question.text
  check_page.wait_for_question_timer_to_expire(5)
  expect(check_page).to have_preload
end

Then(/^I could not answer the question within the configured number of seconds$/) do
  step 'the loading screen has expired'
  @question = check_page.question.text
  check_page.wait_for_question_timer_to_expire(5)
  expect(check_page).to have_preload
end

Then(/^I should be moved to the next question$/) do
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^the route remains the same$/) do
  expected_url = Capybara.app_host + '/check'
  expect(current_url).to eql expected_url
  check_page.wait_for_preload_to_expire(2)
  check_page.wait_for_question
  expect(current_url).to eql expected_url
end

Then(/^I should see the on screen keyboard$/) do
  check_page.wait_for_question
  expect(check_page).to have_number_pad
end

Then(/^I can answer the question using the on screen keyboard$/) do
  check_page.wait_for_preload
  check_page.wait_for_question
  @question = check_page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_numpad(values.first.to_i * values.last.to_i)
  check_page.number_pad.enter.click
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^I can answer the question using their phsyical keyboard$/) do
  check_page.wait_for_preload
  check_page.wait_for_question
  @question = check_page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_keyboard(values.first.to_i * values.last.to_i)
  check_page.number_pad.one.send_keys(:enter)
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^I should be able to use the on screen keyboard to complete the test$/) do
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  @answers = check_page.complete_check_with_correct_answers(questions.size,'numpad')
  p Time.now
  sleep 30
  p Time.now
  p current_url
  # complete_page.wait_for_complete_page
  # expect(complete_page).to have_heading
end

When(/^I have entered an incorrect answer$/) do
  check_page.wait_for_question
  check_page.enter_answer_via_numpad(20)
  @value = check_page.answer.text
end

When(/^I should be able to correct my answer if i am quick enough$/) do
  2.times {check_page.number_pad.backspace.click}
  question = check_page.question.text
  values = question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_keyboard(values.first.to_i * values.last.to_i)
  expect(check_page.answer.text).to_not eql @value
end

Then(/^I should see a timer$/) do
  expect(check_page).to have_timer
end

Given(/^I am on the check loading page$/) do
  step 'I have started the check'
  wait_until {check_page.has_preload?}
end


Then(/^I should see the number of the next questions$/) do
  expect(check_page.preload.text).to eql "Question 1…"
end

Then(/^I should see all the data from the check stored in the DB$/) do
  storage_answers = JSON.parse page.evaluate_script('window.localStorage.getItem("answers");')
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  storage_access_token = JSON.parse page.evaluate_script('window.localStorage.getItem("access_token");')
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  storage_config = JSON.parse page.evaluate_script('window.localStorage.getItem("config");')
  storage_inputs = JSON.parse page.evaluate_script('window.localStorage.getItem("inputs");')
  storage_audit = JSON.parse page.evaluate_script('window.localStorage.getItem("audit");')
  storage_questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  wait_until(300, 1){SqlDbHelper.get_check(storage_pupil['checkCode'])}
  check = SqlDbHelper.get_check(storage_pupil['checkCode'])
  p check
  wait_until(300, 1){SqlDbHelper.get_check_result(check['id'])}
  check_result = SqlDbHelper.get_check_result(check['id'])
  check = JSON.parse(check_result['payload'])
  storage_answers.each {|answer| expect(check['answers']).to include answer}
  storage_inputs.each {|input| expect(check['inputs']).to include input}
  expect(check['tokens']['jwt']['token']).to eql storage_access_token
  [storage_school].each {|audit| expect(check['school']).to include audit}
  [storage_config].each {|audit| expect(check['config']).to include audit}
  storage_questions.each {|audit| expect(check['questions']).to include audit}
  [storage_pupil].each {|audit| expect(check['pupil']).to include audit}
  storage_audit.each do|audit|
    if !((audit['type'].eql?('CheckSubmissionAPICallSucceeded')) || (audit['type'].eql?('CheckSubmissionApiCalled')) || (audit['type'].eql?('CheckComplete')))
      expect(check['audit']).to include audit
    end
  end
end


Given(/^I am on the MTC check start page$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
end

Then(/^I should see the number of questions$/) do
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  expect(mtc_check_start_page.questions.text).to include "There will be #{questions.size} questions."
end


Then(/^I should see the question and timer$/) do
  step 'I should see a question'
  step 'I should see a timer'
end