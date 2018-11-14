class AddEditCheckWindowPage < SitePrism::Page
  set_url '/choose-check-window{/add_or_edit}'

  element :check_name, '#checkWindowName'

  element :admin_start_day, '#adminStartDay'
  element :admin_start_month, '#adminStartMonth'
  element :admin_start_year, '#adminStartYear'
  element :admin_end_day, '#adminEndDay'
  element :admin_end_month, '#adminEndMonth'
  element :admin_end_year, '#adminEndYear'

  element :familiarisation_check_start_day, '#familiarisationCheckStartDay'
  element :familiarisation_check_start_month, '#familiarisationCheckStartMonth'
  element :familiarisation_check_start_year, '#familiarisationCheckStartYear'
  element :familiarisation_check_end_day, '#familiarisationCheckEndDay'
  element :familiarisation_check_end_month, '#familiarisationCheckEndMonth'
  element :familiarisation_check_end_year, '#familiarisationCheckEndYear'

  element :live_check_start_day, '#liveCheckStartDay'
  element :live_check_start_month, '#liveCheckStartMonth'
  element :live_check_start_year, '#liveCheckStartYear'
  element :live_check_end_day, '#liveCheckEndDay'
  element :live_check_end_month, '#liveCheckEndMonth'
  element :live_check_end_year, '#liveCheckEndYear'
  #remove below one once the new check window is live
  element :check_start_day, '#checkStartDay'
  element :check_start_month, '#checkStartMonth'
  element :check_start_year, '#checkStartYear'
  element :check_end_day, '#checkEndDay'
  element :check_end_month, '#checkEndMonth'
  element :check_end_year, '#checkEndYear'

  element :save_changes, 'input[value="Save"]'
  element :back, 'a.button.button-secondary'
  elements :error_message, '.error-message'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :error_summary, 'div[aria-labelledby="error-summary-heading-1"]' do
    element :error_heading, 'h2', text: 'You need to fix the errors on this page before continuing.'
    element :error_text, 'p', text: 'See highlighted errors below'
    elements :error_messages, '.error-summary-list li'
  end

  def enter_details(hash)
    check_name.set hash.fetch(:check_name, '')
    admin_start_day.set hash.fetch(:admin_start_day, '')
    admin_start_month.set hash.fetch(:admin_start_mon, '')
    admin_start_year.set hash.fetch(:admin_start_year, '')
    check_start_day.set hash.fetch(:check_start_day, '')
    check_start_month.set hash.fetch(:check_start_mon, '')
    check_start_year.set hash.fetch(:check_start_year, '')
    check_end_day.set hash.fetch(:check_end_day, '')
    check_end_month.set hash.fetch(:check_end_mon, '')
    check_end_year.set hash.fetch(:check_end_year, '')
  end
end
